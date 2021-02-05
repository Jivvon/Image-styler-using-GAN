import React, { useState } from "react";
import { useHistory } from "react-router-dom"
import imageCompression from "browser-image-compression";
import StyleCard from "./components/StyleCard";
import styleInfo from "../styleInfo";
import { Box, Container, Typography, Grid, Button, RadioGroup } from "@material-ui/core"
import { makeStyles } from '@material-ui/core/styles';

const useStyles = makeStyles((theme) => ({
  heroContent: {
    backgroundColor: theme.palette.background.paper,
    padding: theme.spacing(8, 0, 6),
  },
  heroButtons: {
    marginTop: theme.spacing(4),
  },
  cardGrid: {
    paddingTop: theme.spacing(8),
    paddingBottom: theme.spacing(8),
  }
}));

const Home = () => {
  const [inputImage, setInputImage] = useState(null);
  const [style, setStyle] = useState("");
  const [inputImagePreviewUrl, setInputImagePreviewUrl] = useState("");
  const history = useHistory();
  const classes = useStyles();

  const onStyleChange = (e) => {
    setStyle(e.target.value);
    console.log(style)
  };

  const handleImageChange = async (e) => {
    e.preventDefault();
    const options = {
      maxSizeMB: 2,
      maxWidthOrHeight: 500,
    };
    let imgfile = e.target.files[0];
    setInputImage(imgfile);
    try {
      const compressedFile = await imageCompression(imgfile, options);
      setInputImage(compressedFile);
      imageCompression.getDataUrlFromFile(compressedFile).then((result) => {
        setInputImagePreviewUrl(result);
      });
    } catch (error) {
      console.log(error);
    }
  };

  const resultPageClickHandler = (e) => {
    history.push({
      pathname: "/result",
      state: {
        inputImage: inputImage,
        inputStyle: style
      }
    })
  };

  return (
    <div className={classes.heroContent}>
      <Container maxWidth="sm">
        <Typography component="h1" variant="h2" align="center" color="textPrimary" gutterBottom>
          Convert your images to Styles of Artists!
        </Typography>
        <Typography variant="h5" align="center" color="textSecondary" paragraph>
          Image transition utilizing GAN : Cartoons, Artworks, and more<br />
        </Typography>
        <Typography variant="h5" align="center" color="textSecondary" paragraph>
          1. Upload your image (.png, .jpg, .jpeg)
        </Typography>
        <div className={classes.heroButtons}>
          <Grid container spacing={1} justify="center">
            <Grid item xs={12}>
              {inputImagePreviewUrl && <img src={inputImagePreviewUrl} />}
            </Grid>
            <Grid item>
              <Button variant="contained" size="large" component="label" color="primary">
                Upload
                <input
                  name="file"
                  type="file"
                  hidden
                  onChange={handleImageChange}
                />
              </Button>
            </Grid>
          </Grid>
        </div>
      </Container>

      <Box m="2rem">
        <Typography variant="h5" align="center" color="textSecondary">
          2. Take your pick! Choose your artstyle
        </Typography>

        <Container className={classes.cardGrid}>
          <RadioGroup aria-label="author" name="author" onChange={onStyleChange}>
            <Grid container spacing={4}>
              {styleInfo.map((data, index) => {
                return (
                  <StyleCard
                    key={index}
                    imageSrc={data.imageSrc}
                    style={data.style}
                    explain={data.explain}
                    value={data.value}
                  ></StyleCard>
                );
              })}
            </Grid>
          </RadioGroup>
        </Container>
        <Grid container justify="center">
          <Button variant="contained" size="large" component="label" color="primary" onClick={resultPageClickHandler}>
            Convert
          </Button>
        </Grid>
      </Box>
    </div>
  );
};
export default Home;
