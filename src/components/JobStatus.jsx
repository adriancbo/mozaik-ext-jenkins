var React            = require('react');
var Reflux           = require('reflux');
var moment           = require('moment');
var ApiConsumerMixin = require('mozaik/browser').Mixin.ApiConsumer;

var JobStatus = React.createClass({
    mixins: [
        Reflux.ListenerMixin,
        ApiConsumerMixin
    ],

    propTypes: {
        job: React.PropTypes.string.isRequired
    },

    getInitialState() {
        return {
            builds: []
        };
    },

    getApiRequest() {
        return {
            id: 'jenkins.job.' + this.props.job,
            params: {
                job: this.props.job,
                instance: this.props.instance
            }
        };
    },

    onApiData(builds) {
        this.setState({
            builds: builds
        });
    },

    getCommitInfo(changeSet) {
        let info = changeSet.items[0];

        for(var i = 0; i < changeSet.items.length; i++) {
            let x = changeSet.items[i];
            if(x.author.fullName != "scmbuild") {
                return `${x.msg} by ${x.author.fullName}`;
            }
        }
        return "No changes";
    },

    render() {
        var iconClasses  = 'fa fa-close';
        var currentNode  = null;
        var previousNode = null;

        if (this.state.builds.length > 0) {
            var currentBuild = this.state.builds[0];
            var buildIdx = 0;
            var firstFailure;
            var changeStr = "";

            //Show pass/fail status only.
            if (currentBuild.building === true && this.state.builds.length > 1) {
                currentBuild = this.state.builds[1];
                buildIdx = 1;
            }

            if (currentBuild.result === 'SUCCESS') {
                iconClasses = 'fa fa-check';
                changeStr = `Latest change: ${this.getCommitInfo(currentBuild.changeSet)}`;

            } else if (currentBuild.result === 'FAILURE') {
                firstFailure = currentBuild;
                while(this.state.builds[buildIdx + 1] && this.state.builds[buildIdx + 1].result === 'FAILURE') {
                    firstFailure = this.state.builds[buildIdx+1];
                    buildIdx++;
                }
                changeStr = `Failing since: ${this.getCommitInfo(firstFailure.changeSet)}`;


            }

            var statusClasses = 'jenkins__job-status__current__status jenkins__job-status__current__status--' + currentBuild.result.toLowerCase();

            currentNode = (
                <div className="jenkins__job-status__current">
                    Build #{currentBuild.number}<br />
                    <span className={statusClasses}>
                        {currentBuild.result}&nbsp;
                        <i className={iconClasses} />
                    </span><br/>
                    <span>
                        {changeStr}
                    </span><br />
                    <time className="jenkins__job-status__current__time">
                        <i className="fa fa-clock-o" />&nbsp;
                        {moment(currentBuild.timestamp, 'x').fromNow()}
                    </time>
                </div>
            );

            if (this.state.builds.length > 1) {
                var previousBuild = this.state.builds[1];
                previousNode = (
                    <div className="jenkins__job-status__previous">
                        Previous status was&nbsp;
                        {previousBuild.result}&nbsp;
                        {moment(previousBuild.timestamp, 'x').fromNow()}
                    </div>
                );
            }
        }

        return (
            <div>
                <div className="widget__header">
                    {this.props.title || `Jenkins job ${ this.props.job }`}
                    <i className="fa fa-bug" />
                </div>
                <div className="widget__body">
                    {currentNode}
                    {previousNode}
                </div>
            </div>
        );
    }
});

module.exports = JobStatus;
