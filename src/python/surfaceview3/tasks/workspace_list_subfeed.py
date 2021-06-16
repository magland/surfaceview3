import hither2 as hi
import kachery_client as kc
from ..workspace_list import WorkspaceList

@kc.taskfunction('workspace_list_subfeed.2', type='query')
def task_workspace_list_subfeed(channel: str):
    W = WorkspaceList(channel=channel)
    return W.get_subfeed_uri()