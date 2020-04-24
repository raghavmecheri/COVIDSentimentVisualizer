import React, {useState} from 'react';
import Helmet from 'react-helmet';
import L from 'leaflet';
import { Line } from 'react-chartjs-2';
import Dropdown from 'react-dropdown';
import 'react-dropdown/style.css';
import {Button} from "react-bootstrap"

import { promiseToFlyTo, geoJsonToMarkers, clearMapLayers } from 'lib/map';
import { trackerLocationsToGeoJson, trackerFeatureToHtmlMarker } from 'lib/coronavirus';
import { useCoronavirusTracker } from 'hooks';

import Layout from 'components/Layout';
import Container from 'components/Container';
import Map from 'components/Map';
import LineData from 'data/mocks/chart-data'

const LOCATION = {
  lat: 0,
  lng: 0
};
const CENTER = [LOCATION.lat, LOCATION.lng];
const DEFAULT_ZOOM = 1;

const IndexPage = () => {
  const { data = [] } = useCoronavirusTracker({
    api: 'countries'
  });
  const hasData = Array.isArray(data) && data.length > 0;

  /**
   * mapEffect
   * @description Fires a callback once the page renders
   * @example Here this is and example of being used to zoom in and set a popup on load
   */

  async function mapEffect({ leafletElement: map } = {}) {
    if ( !map || !hasData ) return;

    clearMapLayers({
      map,
      excludeByName: [ 'Mapbox' ]
    })

    const locationsGeoJson = trackerLocationsToGeoJson(data);

    const locationsGeoJsonLayers = geoJsonToMarkers(locationsGeoJson, {
      onClick: handleOnMarkerClick,
      featureToHtml: trackerFeatureToHtmlMarker
    });

    const bounds = locationsGeoJsonLayers.getBounds();

    locationsGeoJsonLayers.addTo(map);

    map.fitBounds(bounds);
  }

  function handleOnMarkerClick({ feature = {} } = {}, event = {}) {
    const { target = {} } = event;
    const { _map: map = {} } = target;


    const { geometry = {}, properties = {} } = feature;
    const { coordinates } = geometry;
    const { countryBounds, countryCode } = properties;

    promiseToFlyTo(map, {
      center: {
        lat: coordinates[1],
        lng: coordinates[0]
      },
      zoom: 3
    });

    if ( countryBounds && countryCode !== 'US' ) {
      const boundsGeoJsonLayer = new L.GeoJSON(countryBounds);
      const boundsGeoJsonLayerBounds = boundsGeoJsonLayer.getBounds();

      map.fitBounds(boundsGeoJsonLayerBounds);
    }
  }

  const mapSettings = {
    center: CENTER,
    defaultBaseMap: 'Mapbox',
    zoom: DEFAULT_ZOOM,
    mapEffect
  };

  const optionList = LineData["options"]
  const [option, setOption] = useState(optionList[0]);
  const [view, setView] = useState(0);

  return (
    <Layout pageName="home">
      <Helmet>
      <link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/bootstrap/4.1.0/css/bootstrap.min.css" 
    integrity="sha384-9gVQ4dYFwwWSjIDZnLEWnxCjeSWFphJiwGPXr1jddIhOegiu1FwO5qRGvFXOdJZ4" 
    crossorigin="anonymous" />
        <title>COVIDSentiment</title>
      </Helmet>

       {
         view == 0 ? (
           <React.Fragment>
           <Map {...mapSettings} />
           <Button style={{marginTop: "2vh", marginLeft: "5vw", float: "left"}} onClick={() => {
              setView(1)
            }}>View Visualisations</Button>
           </React.Fragment>
           ) : (
           <div style={{textAlign: "center", paddingLeft: "5vw", paddingRight: "5vw"}}>
           <Button style={{float: "left", marginTop: "2vh"}} onClick={() => {
              setView(0)
            }}>View Map</Button>
              <h3 style={{marginTop: "4vh"}}>How has COVID-19 made {option} feel?</h3>
              <div style={{width: "10vw", float: "right"}}>
              <Dropdown options={optionList} onChange={(selection) => setOption(selection.value)} value={option} placeholder="Select an option"/>
              </div>
              <div style={{display:"block", paddingRight: "10vw", paddingLeft: "10vw"}}>
              <Line data={LineData["breakup"][option]} height={80} />
              </div>
             <h3 style={{marginTop: "4vh"}}>How has COVID-19 made people feel?</h3>
              <div style={{display:"block", paddingRight: "10vw", paddingLeft: "10vw"}}>
                <Line data={LineData["aggregate"]} height={80} />
              </div>
            </div>
           )
       }


      <Container type="content" className="text-center home-start">
        <h2>Mapping the mental health effects of social isolation</h2>
        <p style={{textAlign: "justify", marginTop: "1vh", marginBottom: "2vh"}}>
        COVID-19 has had a global impact, with the disease people across all sections of society. In a testing time like this, mental health is also increasingly becoming a concern, especially with social isolation becoming key to defeat COVID-19.
        </p>
        <p style={{textAlign: "justify", marginTop: "1vh", marginBottom: "2vh"}}> The purpose of this platform is to provide a demonstration of the insights that our <a href="https://github.com/raghavmecheri/COVIDSentiment">COVIDSentiment</a> platform is capable of generating, on live twitter data. The end goal of COVIDSentiment is to create an NLP based platform that is capable of understanding social media sentiment on both a macro, as well as a micro scale, in order to help those whose mental health is adversely affected by COVID-19.
        </p>
        <p style={{textAlign: "justify", marginTop: "1vh", marginBottom: "4vh"}}>
          The purpose of this portal is to stack and visualise aggregate global sentiment around COVID-19, obtained by the datapoints generated by COVIDSentiment. For more granular insights/access to our data, please feel free to contact us! For the purposes of this demonstration, we have 17 countries with the highest number of COVID-19 infections
        </p>
        
        
        
        <ul>
          <li>
            Uses <a href="https://github.com/ketanjog/CovidSentimentAnalysis">github.com/ketanjog/CovidSentimentAnalysis</a>
          </li>
          <li>  
            Uses <a href="https://github.com/raghavmecheri/COVIDSentiment">github.com/raghavmecheri/COVIDSentiment</a> via <a href="https://covidsentiment.herokuapp.com/">covidsentiment.herokuapp.com/</a>
          </li>
          <li>
            which uses - <a href="https://github.com/thepanacealab/covid19_twitter">github.com/thepanacealab/covid19_twitter</a> - by the <a href="https://github.com/thepanacealab"> Panacea Lab </a> (with permission)
          </li>
        </ul>
      </Container>
    </Layout>
  );
};

export default IndexPage;
