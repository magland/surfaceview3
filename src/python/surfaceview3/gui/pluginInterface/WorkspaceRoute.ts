import { ChannelName, isFeedId } from 'kachery-js/types/kacheryTypes'
import { parseWorkspaceUri } from 'labbox-react'
import QueryString from 'querystring'

type Page = 'workspace' | 'model' | 'modelSurface' | 'modelVectorField3D' | 'modelSyncView'
export const isWorkspacePage = (x: string): x is Page => {
    return ['workspace', 'model', 'modelSurface', 'modelVectorField3D', 'modelSyncView'].includes(x)
}

type WorkspaceMainRoute = {
    workspaceUri?: string
    channelName?: ChannelName
    page: 'workspace'
}
type WorkspaceModelRoute = {
    workspaceUri?: string
    channelName?: ChannelName
    page: 'model'
    modelId: string
}
type WorkspaceModelSurfaceRoute = {
    workspaceUri?: string
    channelName?: ChannelName
    page: 'modelSurface'
    modelId: string
    surfaceName: string
}
type WorkspaceModelVectorField3DRoute = {
    workspaceUri?: string
    channelName?: ChannelName
    page: 'modelVectorField3D'
    modelId: string
    vectorField3DName: string
}
type WorkspaceModelSyncViewRoute = {
    workspaceUri?: string
    channelName?: ChannelName
    page: 'modelSyncView'
    modelId: string
    vectorField3DNames: string[]
    surfaceNames: string[]
}
export type WorkspaceRoute = WorkspaceMainRoute | WorkspaceModelRoute | WorkspaceModelSurfaceRoute | WorkspaceModelVectorField3DRoute | WorkspaceModelSyncViewRoute
type GotoMainPageAction = {
    type: 'gotoMainPage'
}
type GotoModelPageAction = {
    type: 'gotoModelPage'
    modelId: string
}
type GotoModelSurfacePageAction = {
    type: 'gotoModelSurfacePage'
    modelId: string
    surfaceName: string
}
type GotoModelVectorField3DPageAction = {
    type: 'gotoModelVectorField3DPage'
    modelId: string
    vectorField3DName: string
}
type GotoModelSyncViewPageAction = {
    type: 'gotoModelSyncViewPage'
    modelId: string
    vectorField3DNames: string[]
    surfaceNames: string[]
}
export type WorkspaceRouteAction = GotoMainPageAction | GotoModelPageAction | GotoModelSurfacePageAction | GotoModelVectorField3DPageAction | GotoModelSyncViewPageAction
export type WorkspaceRouteDispatch = (a: WorkspaceRouteAction) => void

export interface LocationInterface {
    pathname: string
    search: string
}

export interface HistoryInterface {
    location: LocationInterface
    push: (x: LocationInterface) => void
}

export const routeFromLocation = (location: LocationInterface): WorkspaceRoute => {
    const pathList = location.pathname.split('/')

    const query = QueryString.parse(location.search.slice(1));
    const workspace = (query.workspace as string) || ''
    let workspaceUri: string | undefined = undefined
    if (workspace.startsWith('workspace://')) {
        workspaceUri = workspace
    }
    else if (isFeedId(workspace)) {
        workspaceUri = `workspace://${workspace}`
    }
    const channelName = ((query.channel as string) || undefined) as ChannelName | undefined

    let page = pathList[2] || 'workspace'
    if (!isWorkspacePage(page)) throw Error(`Invalid page: ${page}`)
    switch (page) {
        case 'workspace': return {
            workspaceUri,
            channelName,
            page
        }
        case 'model': {
            const modelId = pathList[3]
            if (pathList[4] === 'surface') {
                return {
                    workspaceUri,
                    channelName,
                    page: 'modelSurface',
                    modelId,
                    surfaceName: pathList[5]
                }
            }
            else if (pathList[4] === 'vectorField3D') {
                return {
                    workspaceUri,
                    channelName,
                    page: 'modelVectorField3D',
                    modelId,
                    vectorField3DName: pathList[5]
                }
            }
            else if (pathList[4] === 'syncView') {
                return {
                    workspaceUri,
                    channelName,
                    page: 'modelSyncView',
                    modelId,
                    vectorField3DNames: ((query['vf3'] || '') as string).split(','),
                    surfaceNames: ((query['s'] || '') as string).split(',')
                }
            }
            else {
                return {
                    workspaceUri,
                    channelName,
                    page: 'model',
                    modelId
                }
            }
        }
        default: return {
            workspaceUri,
            channelName,
            page: 'workspace'
        }
    }
}

export const locationFromRoute = (route: WorkspaceRoute) => {
    const queryParams: { [key: string]: string } = {}
    if (route.workspaceUri) {
        const {feedId: workspaceFeedId} = parseWorkspaceUri(route.workspaceUri)
        if (workspaceFeedId) {
            queryParams['workspace'] = workspaceFeedId.toString()
        }
    }
    if (route.channelName) {
        queryParams['channel'] = route.channelName.toString()
    }
    switch (route.page) {
        case 'workspace': return {
            pathname: `/workspace`,
            search: queryString(queryParams)
        }
        case 'model': return {
            pathname: `/workspace/model/${route.modelId}`,
            search: queryString(queryParams)
        }
        case 'modelSurface': return {
            pathname: `/workspace/model/${route.modelId}/surface/${route.surfaceName}`,
            search: queryString(queryParams)
        }
        case 'modelVectorField3D': return {
            pathname: `/workspace/model/${route.modelId}/vectorField3D/${route.vectorField3DName}`,
            search: queryString(queryParams)
        }
        case 'modelSyncView': {
            const q = {...queryParams}
            if (route.surfaceNames.length > 0) {
                q['s'] = route.surfaceNames.join(',')
            }
            if (route.vectorField3DNames.length > 0) {
                q['vf3'] = route.vectorField3DNames.join(',')
            }
            return {
                pathname: `/workspace/model/${route.modelId}/syncView`,
                search: queryString(q)
            }
        }
        default: return {
            pathname: `/`,
            search: queryString(queryParams)
        }
    }
}

var queryString = (params: { [key: string]: string }) => {
    const keys = Object.keys(params)
    if (keys.length === 0) return ''
    return '?' + (
        keys.map((key) => {
            return encodeURIComponent(key) + '=' + encodeURIComponent(params[key])
        }).join('&')
    )
}

export const workspaceRouteReducer = (s: WorkspaceRoute, a: WorkspaceRouteAction): WorkspaceRoute => {
    let newRoute: WorkspaceRoute = s
    switch (a.type) {
        case 'gotoMainPage': newRoute = {
            page: 'workspace',
            workspaceUri: s.workspaceUri,
            channelName: s.channelName
        }; break;
        case 'gotoModelPage': newRoute = {
            page: 'model',
            modelId: a.modelId,
            workspaceUri: s.workspaceUri,
            channelName: s.channelName
        }; break;
        case 'gotoModelSurfacePage': newRoute = {
            page: 'modelSurface',
            modelId: a.modelId,
            surfaceName: a.surfaceName,
            workspaceUri: s.workspaceUri,
            channelName: s.channelName
        }; break;
        case 'gotoModelVectorField3DPage': newRoute = {
            page: 'modelVectorField3D',
            modelId: a.modelId,
            vectorField3DName: a.vectorField3DName,
            workspaceUri: s.workspaceUri,
            channelName: s.channelName
        }; break;
        case 'gotoModelSyncViewPage': newRoute = {
            page: 'modelSyncView',
            modelId: a.modelId,
            vectorField3DNames: a.vectorField3DNames,
            surfaceNames: a.surfaceNames,
            workspaceUri: s.workspaceUri,
            channelName: s.channelName
        }; break;
    }
    return newRoute
}

// jinjaroot synctool exclude