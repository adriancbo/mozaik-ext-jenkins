import React, { Component, PropTypes } from 'react';
import reactMixin                      from 'react-mixin';
import { ListenerMixin }               from 'reflux';
import Mozaik                          from 'mozaik/browser'

const informationUnavailableMessage = "Information Unavailable";

class Coverage extends Component {

    constructor() {
        super();
        this.state = {
            coverage:{
                line: informationUnavailableMessage,
                function: informationUnavailableMessage,
                branch: informationUnavailableMessage
            }
        };
    }

    getApiRequest() {
        return {
            id: 'jenkins.coverage.' + this.props.job,
            params: {
                job: this.props.job,
                reporter: this.props.reporter
            }
        };
    }

    onApiData(coverage) {
        this.setState({
            coverage: {
                function: Math.round(coverage.function),
                line:  Math.round(coverage.line),
                branch: Math.round(coverage.branch)
            }
        });
    }

    getStyledCoverage(coverage, threshold) {
        if (threshold === undefined || coverage === NaN) {
            return {};
        }
        if(coverage >= threshold.upper) {
            return {color: "green"};
        } else if (coverage < threshold.lower) {
            return {color: "red"};
        } else {
            return {color: "yellow"};
        }
    }

    render() {
        let classes = `list__item`;

        return (
            <div>
                <div className="widget__header">
                    {this.props.title || "Code Coverage"}
                    <a href={`http://fmsscm.corp.intuit.net/qbo-build/job/${this.props.job}`}><i style={{color: "#e0c671"}} className="fa fa-external-link"/></a>
                </div>
                <div className={classes} style={this.getStyledCoverage(this.state.coverage.line, this.props.thresholds.line)}>
                    Line Coverage: {this.state.coverage.line}
                </div>
                <div className={classes} style={this.getStyledCoverage(this.state.coverage.function, this.props.thresholds.function)}>
                    Function Coverage: {this.state.coverage.function}
                </div>
                <div className={classes} style={this.getStyledCoverage(this.state.coverage.branch, this.props.thresholds.branch)}>
                    Branch Coverage: {this.state.coverage.branch}
                </div>


            </div>
        );
    }
}

reactMixin(Coverage.prototype, ListenerMixin);
reactMixin(Coverage.prototype, Mozaik.Mixin.ApiConsumer);

export { Coverage as default };