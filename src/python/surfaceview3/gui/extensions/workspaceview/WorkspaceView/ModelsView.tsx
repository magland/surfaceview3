import { Button } from '@material-ui/core';
import { useVisible } from 'labbox-react';
import MarkdownDialog from 'labbox-react/components/Markdown/MarkdownDialog';
import ModalWindow from 'labbox-react/components/ModalWindow/ModalWindow';
import React, { FunctionComponent, useCallback } from 'react';
import { WorkspaceViewProps } from '../../../pluginInterface/WorkspaceViewPlugin';
import AddModelInstructions from './AddModelInstructions';
import ModelsTable from './ModelsTable';
import workspacePermissionsMd from './workspacePermissions.md.gen';

export interface LocationInterface {
  pathname: string
  search: string
}

export interface HistoryInterface {
  location: LocationInterface
  push: (x: LocationInterface) => void
}

const ModelsView: FunctionComponent<WorkspaceViewProps> = ({ workspace, workspaceDispatch, workspaceRoute, workspaceRouteDispatch, width=500, height=500 }) => {
  const handleModelClicked = useCallback((modelId: string) => {
      workspaceRouteDispatch({
        type: 'gotoModelPage',
        modelId
      })
  }, [workspaceRouteDispatch])
  
  const {visible: addModelInstructionsVisible, show: showAddModelInstructions, hide: hideAddModelInstructions} = useVisible()
  const {visible: workspaceSettingsVisible, show: showWorkspaceSettings, hide: hideWorkspaceSettings} = useVisible()

  const handleDeleteModels = useCallback((modelIds: string[]) => {
    workspaceDispatch && workspaceDispatch({
      type: 'deleteModels',
      modelIds
    })
}, [workspaceDispatch])

  const readOnly = workspaceDispatch ? false : true

  return (
    <div>
      <div>
        <div><Button onClick={showAddModelInstructions}>Add model</Button></div>
        <div><Button onClick={showWorkspaceSettings}>Set workspace permissions</Button></div>
        <ModelsTable
            models={workspace.models}
            onModelClicked={handleModelClicked}
            onDeleteModels={readOnly ? undefined : handleDeleteModels}
        />
      </div>
      <ModalWindow
            open={addModelInstructionsVisible}
            onClose={hideAddModelInstructions}
        >
          <AddModelInstructions />
      </ModalWindow>
      <MarkdownDialog
        visible={workspaceSettingsVisible}
        onClose={hideWorkspaceSettings}
        source={workspacePermissionsMd}
        substitute={{workspaceUri: workspaceRoute.workspaceUri}}
      />
    </div>
  )


  // return (
  //   <Splitter
  //           {...{width, height}}
  //           initialPosition={300}
  //           positionFromRight={true}
  //   >
  //     <div>
  //         {
  //             !instructionsVisible && (
  //                 <div><Button onClick={showInstructions}>Add model</Button></div>
  //             )
  //         }
  //         <ModelsTable
  //           models={workspace.models}
  //           onModelSelected={handleModelSelected}
  //         />
  //     </div>
  //     {
  //         instructionsVisible && (
  //             <AddModelInstructions />
  //         )
  //     }
      
  //   </Splitter>
  // )
}

export default ModelsView