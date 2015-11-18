var React            = require('react');
var Reflux           = require('reflux');
var moment           = require('moment');
var ApiConsumerMixin = require('mozaik/browser').Mixin.ApiConsumer;

var JobStatusTestBreakdown = React.createClass({
    mixins: [
        Reflux.ListenerMixin,
        ApiConsumerMixin
    ],

    propTypes: {
        job: React.PropTypes.string.isRequired
    },

    getInitialState() {
        return {
            tests: {
                suites: []
            }
        };
    },

    getApiRequest() {
        return {
            id: 'jenkins.testReport.' + this.props.job,
            params: {
                job: this.props.job
            }
        };
    },

    onApiData(tests) {
        this.setState({
            tests: tests
        });
    },

    render() {
        var iconClasses  = 'fa fa-close';
        var currentNode  = null;
        var previousNode = null;


            var buildIdx = 0;
            var firstFailure;
            var suiteNodes = [];



            for (let i = 0; i<this.state.tests.suites.length; i++) {
                let suite = this.state.tests.suites[i];
                let numPassing = suite.cases.length, numFailing = 0;
                for (let j = 0; j < numPassing; j++) {
                    let test = suite.cases[j];
                    if (test.status !== "PASSED" && test.status !== "FIXED" ) {
                        numPassing--;
                        numFailing++;
                    }
                }
                let statusText = numPassing == suite.cases.length ? "All tests passing" : `${numFailing} / ${numPassing+numFailing} failing.`;
                let statusNode = <div style={{color: numPassing == suite.cases.length ? "green" : "red" }}>{statusText}</div>;

                suiteNodes.push(<div className="list__item">{suite.name} : {suite.cases.length} {statusNode} </div>);
            }



        return (
            <div>
                <div className="widget__header">
                    {this.props.title || `Jenkins job ${ this.props.job }`}
                    <i className="fa fa-bug" />
                </div>
                <div className="widget__body">
                    {suiteNodes}
                </div>
            </div>
        );
    }
});

module.exports = JobStatusTestBreakdown;