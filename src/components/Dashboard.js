import React, { Component } from "react";

import classnames from "classnames";
import axios from 'axios';

import Loading from './Loading';
import Panel from './Panel';

import {
  getTotalInterviews,
  getLeastPopularTimeSlot,
  getMostPopularDay,
  getInterviewsPerDay
 } from "helpers/selectors";

import { setInterview } from "helpers/reducers";

const data = [
  {
    id: 1,
    label: "Total Interviews",
    getValue: getTotalInterviews
  },
  {
    id: 2,
    label: "Least Popular Time Slot",
    getValue: getLeastPopularTimeSlot
  },
  {
    id: 3,
    label: "Most Popular Day",
    getValue: getMostPopularDay
  },
  {
    id: 4,
    label: "Interviews Per Day",
    getValue: getInterviewsPerDay
  }
];

class Dashboard extends Component {

  //default state
  state = {
    loading: true,
    focused: null,
    days: [],
    appointments: {},
    interviewers: {}
  }

  componentDidMount() {
    const focused = JSON.parse(localStorage.getItem("focused"));

    if (focused) {
      this.setState({ focused });
    }

    //get information from API
    Promise.all([
      axios.get("/api/days"),
      axios.get("/api/appointments"),
      axios.get("/api/interviewers")
    ]).then(([days, appointments, interviewers]) => {
      this.setState({
        loading: false,
        days: days.data,
        appointments: appointments.data,
        interviewers: interviewers.data
      });
    });

    //create socket connection
    this.socket = new WebSocket(process.env.REACT_APP_WEBSOCKET_URL);

    //listen for messages on the socket connection and use them to update the state when we book or cancel an interview.
    this.socket.onmessage = event => {
      const data = JSON.parse(event.data);
    
      if (typeof data === "object" && data.type === "SET_INTERVIEW") {
        this.setState(previousState =>
          setInterview(previousState, data.id, data.interview)
        );
      }
    };
  }

  componentDidUpdate(previousProps, previousState) {
    if (previousState.focused !== this.state.focused) {
      localStorage.setItem("focused", JSON.stringify(this.state.focused));
    }
  }

  componentWillUnmount() {
    //clean up socket connection
    this.socket.close();
  }

  //changes state based on value of focused
  //if previous is not null, show null
  //otherwise show panel with specific id
  selectPanel = id => {

    this.setState(previousState => ({
      focused: previousState.focused !== null? null : id
    }));
    
  }

  render() {

    //renders classes conditionally based on focused state
    const dashboardClasses = classnames("dashboard", {
      "dashboard--focused": this.state.focused
    });
    
    //if loading is true, show "Loading" component
    if (this.state.loading) {
      return <Loading />
    }

    //filters panels depending on the focused state
    //If this.state.focused is null then return true for every panel
    //If this.state.focused is equal to the Panel, then let it through the filter
    //next we map through the data to render the component
    const panels = data
      .filter(
        panel => this.state.focused === null || this.state.focused === panel.id
      )
      .map(panel => 
        (
          <Panel
            key={panel.id}
            id={panel.id}
            label={panel.label}
            value={panel.getValue(this.state)}
            onSelect={this.selectPanel}
          />
        )
      )

    return (
      <main className={dashboardClasses}>
        {panels}
      </main>

    );
  }
}

export default Dashboard;
