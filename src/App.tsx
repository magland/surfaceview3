import { MuiThemeProvider } from '@material-ui/core';
import { testSignatures } from 'kachery-js/crypto/signatures';
import { nodeLabel } from 'kachery-js/types/kacheryTypes';
import KacheryNodeSetup from 'kachery-react/KacheryNodeSetup';
import { GoogleSignInSetup } from 'labbox-react';
import { HomePageProps } from 'labbox-react/HomePage/HomePage';
import MainWindow from 'labbox-react/MainWindow/MainWindow';
import WorkspacePage from 'python/surfaceview3/gui/WorkspacePage/WorkspacePage';
import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import './App.css';
import introMd from './intro.md.gen';
import packageName from './python/surfaceview3/gui/packageName';
import { pythonProjectVersion, webAppProjectVersion } from './python/surfaceview3/gui/version';
// import logo from './logo.svg';
// import logo from './spike-icon.png';
import taskFunctionIds from './taskFunctionIds';
import theme from './theme';

testSignatures()

const homePageProps: HomePageProps = {
  taskFunctionIds,
  introMd,
  packageName,
  workspaceDescription: 'A surfaceview workspace is a collection of models which contain 3D vector fields and surfaces.',
  pythonProjectVersion,
  webAppProjectVersion,
  repoUrl: "https://github.com/magland/surfaceview3"
}

function App() {
  return (
    <div className="App">
      <MuiThemeProvider theme={theme}>
        <BrowserRouter>
          <GoogleSignInSetup>
            <KacheryNodeSetup nodeLabel={nodeLabel("surfaceview")}>
              <MainWindow logo={undefined} homePageProps={homePageProps}>
                <WorkspacePage
                  width={0} // will be filled in
                  height={0}
                />
              </MainWindow>
            </KacheryNodeSetup>
          </GoogleSignInSetup>
        </BrowserRouter>
      </MuiThemeProvider>
    </div>
  )
}

export default App;
