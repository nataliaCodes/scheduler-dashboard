import React, { Component } from "react";

import classnames from "classnames";

import Loading from './Loading';
import Panel from './Panel';

const data = [
  {
    id: 1,
    label: "Total Interviews",
    value: 6
  },
  {
    id: 2,
    label: "Least Popular Time Slot",
    value: "1pm"
  },
  {
    id: 3,
    label: "Most Popular Day",
    value: "Wednesday"
  },
  {
    id: 4,
    label: "Interviews Per Day",
    value: "2.3"
  }
];

class Dashboard extends Component {

  //default state
  state = {
    loading: false,
    focused: null
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
            value={panel.value}
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
