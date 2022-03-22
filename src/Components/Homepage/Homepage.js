import React from "react";

import Header from "../Header/Header";
import OrderReport from "../OrderTable/today";
import BoxDashboards from "../BoxDashboard/BoxDashboard";

import { Grid } from "@mui/material";

const Homepage = () => {
  return (
    <>
      <Header />
      <BoxDashboards />
      <Grid style={{ padding: "1rem" }}>
        <OrderReport />
      </Grid>
    </>
  );
};

export default Homepage;
