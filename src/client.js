import request from 'superagent';
import config  from './config';
import Promise from 'bluebird';
import chalk   from 'chalk';
require('superagent-bluebird-promise');


/**
 * @param {Mozaik} mozaik
 */
const client = function (mozaik) {

    mozaik.loadApiConfig(config);

    function buildRequest(path, baseUrlOverride, userOverride, passwordOverride) {
        let url = baseUrlOverride ? baseUrlOverride + path : config.get('jenkins.baseUrl') + path;

        mozaik.logger.info(chalk.yellow(`[jenkins] fetching from ${ url }`));

        return request.get(url)
            .auth(
                userOverride ? userOverride : config.get('jenkins.basicAuthUser'),
                passwordOverride ? passwordOverride : config.get('jenkins.basicAuthPassword')
            )
            .promise()
        ;
    }

    return {
        coverage(params) {
            return buildRequest(`/job/${params.job}/lastSuccessfulBuild/${params.reporter}/api/json?depth=2`, `${params.baseUrl}`, `${params.user}`, `${params.password}`)
            .then((res) => {
                    if(params.reporter === "cobertura") {
                        return {
                            function: res.body.results.elements[3].ratio,
                            line: res.body.results.elements[4].ratio,
                            branch: res.body.results.elements[5].ratio
                        }
                    } else if(params.reporter === "jacoco") {
                        return {
                            function: res.body.methodCoverage.percentageFloat,
                            line: res.body.lineCoverage.percentageFloat,
                            branch: res.body.branchCoverage.percentageFloat
                        }
                    }

                })
        },
        coverageHistory: function(params) {
            return request.get(`http://fmsscm.corp.intuit.net/sonar/api/timemachine?resource=${params.id}&metrics=line_coverage,branch_coverage`)
                .promise().then(function(res) {
                    return res.body;
                });
        },

        testReport(params) {
            return buildRequest(`/job/${ params.job }/lastCompletedBuild/testReport/api/json`,  `${params.baseUrl}`, `${params.user}`, `${params.password}`)
                .then(res => res.body)
                ;
        },

        jobs() {
            return buildRequest('/api/json?tree=jobs[name,lastBuild[number,building,timestamp,result]]&pretty=true',  `${params.baseUrl}`, `${params.user}`, `${params.password}`)
                .then(res => res.body.jobs)
            ;
        },

        job(params) {
            return buildRequest(`/job/${ params.job }/api/json?pretty=true&depth=10&tree=builds[number,duration,result,builtOn,timestamp,id,building,changeSet[items[msg,author[fullName]]]]`,  `${params.baseUrl}`, `${params.user}`, `${params.password}`)
                .then(res => res.body.builds)
            ;
        },

        jobBuild(params) {
            return buildRequest(`/job/${ params.job }/${ params.buildNumber }/api/json?pretty=true`,  `${params.baseUrl}`, `${params.user}`, `${params.password}`)
                .then(res => res.body)
            ;
        },

        view(params) {
            return buildRequest(`/view/${ params.view }/api/json?pretty=true&depth=1`,  `${params.baseUrl}`, `${params.user}`, `${params.password}`)
                .then(res => {
                    let view = res.body;
                    let jobs = view.jobs;

                    let builds = [];

                    // Fetch builds details
                    jobs.forEach(function (job) {
                        [
                            'lastBuild',
                            'lastFailedBuild',
                            'lastSuccessfulBuild'
                        ].forEach(function (buildType) {
                            if (job[buildType]) {
                                builds.push(
                                    module.exports.jobBuild({
                                        job:         job.name,
                                        buildNumber: job[buildType].number
                                    })
                                    .then(function (build) {
                                        job[buildType] = build;
                                    })
                                );
                            }
                        });
                    });

                    return Promise.all(builds)
                        .then(() => view)
                    ;
                })
            ;
        }
    };
};


export { client as default };
