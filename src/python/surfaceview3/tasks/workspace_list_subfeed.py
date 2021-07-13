import hither2 as hi
import kachery_client as kc
from ..workspace_list import WorkspaceList

@kc.taskfunction('surfaceview3_workspace_list_subfeed.2', type='query')
def task_surfaceview3_workspace_list_subfeed(name: str):
    W = WorkspaceList(list_name=name)
    return W.get_subfeed_uri()