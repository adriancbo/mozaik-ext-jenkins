import React, { Component, PropTypes } from 'react';
import moment                          from 'moment';


class JobBuild extends Component {
    render() {
        let { build, job, baseUrl, user, password } = this.props;

        let classes = `list__item list__item--with-status list__item--with-status--${ build.result.toLowerCase() }`;
        let link = `http://fmsscm.corp.intuit.net/qbo-build/job/${job}/${build.number}`;

        return (
            <div className={classes}>
                #{build.number} {build.result}&nbsp;
                <time className="list__item__time">
                    <i className="fa fa-clock-o" />&nbsp;
                    {moment(build.timestamp, 'x').fromNow()}
                </time>
                <a href={link}><i style={{float: "right", color: "#e0c671"}}className="fa fa-external-link fa-lg" /></a>
            </div>
        );
    }
}

JobBuild.propTypes = {
    build: PropTypes.object.isRequired
};

export { JobBuild as default };
