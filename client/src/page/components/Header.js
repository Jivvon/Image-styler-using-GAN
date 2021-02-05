import React from "react";
import { AppBar, Toolbar, Grid, Typography } from '@material-ui/core'

const Header = () => {
  const scrollTo = (y) => {
    window.scrollTo(0, y);
  }

  return (
    <AppBar position="fixed">
      <Toolbar>
        <Grid container spacing={3}>
          <Grid item xs={4}>
              <a href="#image" onClick={() => scrollTo(0)}>
            <Typography variant="h6" align="center" noWrap>
                UPLOAD
            </Typography>
              </a>
          </Grid>
          <Grid item xs={4}>
            <Typography variant="h6" align="center" noWrap>
              <a href="#overview" onClick={()=>{scrollTo(1800)}}>OVERVIEW</a>
            </Typography>
          </Grid>
          <Grid item xs={4}>
            <Typography variant="h6" align="center" noWrap>
              <a href="#about" onClick={()=>{scrollTo(3000)}}>ABOUT</a>
            </Typography>
          </Grid>
        </Grid>
      </Toolbar>
    </AppBar>
  )

};

export default Header;
