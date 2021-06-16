import kachery_client as kc
from ..package_name import package_name
from ..workspace import Workspace

class WorkspaceList:
    def __init__(self, channel: str):
        self._channel = channel
    def add_workspace(self, *, name: str, workspace: Workspace):
        sf = kc.load_subfeed(self.get_subfeed_uri())
        sf.append_message({
            'action': {
                'type': 'add',
                'workspace': {
                    'name': name,
                    'uri': workspace.uri
                }
            }
        })
    def get_subfeed_uri(self):
        k = {'name': f'{package_name}-workspace-list', 'channel': self._channel}
        feed_uri = kc.get(k)
        if feed_uri is None:
            feed_uri = kc.create_feed().uri
            kc.set(k, feed_uri)
        f = kc.load_feed(feed_uri)
        return f.load_subfeed('workspace-list').uri