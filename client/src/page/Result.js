import React, { useEffect, useState } from "react";
import { useHistory, useLocation } from "react-router-dom";
import { Box, Grid, Typography, Button, Card, CardMedia, CardContent } from "@material-ui/core"
import { makeStyles } from '@material-ui/core/styles';
import axios from "axios";

const useStyles = makeStyles((theme) => ({
  cardGrid: {
    paddingTop: theme.spacing(8),
    paddingBottom: theme.spacing(8),
  },
  card: {
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
  },
  cardMedia: {
    paddingTop: '100%'
  },
  cardContent: {
    flexGrow: 1,
  },
}));

const Result = () => {
  const [inputImagePath, setInputImagePath] = useState("");
  const [outputImagePath, setOutputImagePath] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [filename, setFilename] = useState("");
  const history = useHistory();
  const location = useLocation();
  const classes = useStyles();
  const { inputImage, inputStyle } = location.state;
  const baseInputImage = "assets/image_input/"
  const baseOutputImage = "assets/image_output/"

  const retryClickHandler = () => {
    history.goBack();
    window.scrollTo(0, 0);
  }

  useEffect(() => {
    console.log("=== useEffect ===");
    (async () => {
      try {
        const fd = new FormData();
        fd.append("file", inputImage, inputImage.name);
        fd.append("author", inputStyle);

        console.log(inputImage);
        console.log(inputStyle);
        for (var key of fd.keys()) {
          console.log(key);
        }
        for (var value of fd.values()) {
          console.log(value);
        }

        // 1. image upload
        const res1 = await axios
          .post("http://127.0.0.1:8000/image/upload", fd, {
            headers: {
              "content-type": "multipart/form-data",
            },
          })
          .then((res) => {
            console.log(res.data["filename"]);
            setFilename(res.data["filename"]);
            // setInputImagePath('assets/image_input/e26ae327a16505f6.jpg')
            setInputImagePath(baseInputImage + res.data["filename"])
            console.log(
              `filename (image/upload의 응답) : ${res.data["filename"]}`
            );
            console.log(`filename (image/upload의 응답) : ${filename}`);
          });

      } catch (e) {
        console.error(e);
        setError(e);
      } finally {
        setLoading(false);
      }
    })()
  }, [inputImage]);

  useEffect(() => {
    // 2. image result
    (async () => {
      console.log('filename 바뀜: ' + filename)
      if (!filename) return; // filename이 비어있으면 그냥 return
      const res2 = await axios
        .post(
          "http://127.0.0.1:8000/image/result",
          JSON.stringify({ filename: filename, style: inputStyle }),
          {
            headers: {
              "Content-Type": "application/json",
              Accept: "application/json",
            },
            method: "POST",
          }
        )
        .then((res) => {
          // setInputImagePath(baseInputImage + res.data["filename"])
          setOutputImagePath(baseOutputImage + res.data['filename']);
          console.log(`outputImagePath (image/result의 응답) : ${res.data['filename']}`)
        });

      console.log(`inputImage : ${inputImage}`);
      console.log(`outputImagePath : ${outputImagePath}`);
    })()
  }, [filename])


  return (
    <>
      <Box m="5rem">
        <Typography variant="h3" align="center" color="textSecondary" paragraph>Converted Result</Typography>
        {loading && <Typography variant="h5" align="center" color="textSecondary" paragraph>Loading...</Typography>}
        {error && <Typography variant="h5" align="center" color="textSecondary" paragraph>Error Occurred</Typography>}

        <Grid container spacing={2} justify="center">
          <Grid item xs={6}>
            {inputImagePath &&
              <Card className={classes.card}>
                <CardMedia
                  className={classes.cardMedia}
                  image={require('.././' + inputImagePath).default}
                />{/* 매개변수의 앞에 .이 들어가면 안 된다. 여기서 붙여주어야 한다. webpack 때문임. */}
              <CardContent className={classes.cardContent}>
                <Typography variant="h6" align="center" color="textSecondary" paragraph>Original Image</Typography>
              </CardContent>
              </Card>}
          </Grid>
          <Grid item xs={6}>
            {inputImagePath &&
              <Card className={classes.card}>
                <CardMedia
                  className={classes.cardMedia}
                  image={require('.././' + outputImagePath).default}
                />
              <CardContent className={classes.cardContent}>
                <Typography variant="h6" align="center" color="textSecondary" paragraph>Generated Image</Typography>
              </CardContent>
              </Card>}
          </Grid>
        </Grid>
      </Box>

      <Grid container justify="center">
        <Button variant="contained" size="large" component="label" color="primary" onClick={retryClickHandler}>
          Retry
        </Button>
      </Grid>
    </>
  );
};

export default Result;
