import numpy as np
import hither2 as hi
import kachery_client as kc
import surfaceview3
from surfaceview3.config import job_cache, job_handler
from surfaceview3.workspace_list import WorkspaceList

@hi.function('get_surface_data', '0.1.2')
def get_surface_data(surface_uri: str):
    S = surfaceview3.Surface(surface_uri)
    return dict({
        'vertices': S.vertices.astype(np.float32),
        'faces': S.faces.astype(np.int32),
        'ifaces': S.ifaces.astype(np.int32)
    })

@kc.taskfunction('get_surface_data.6', type='pure-calculation')
def task_get_surface_data(surface_uri: str):
    with hi.Config(job_handler=job_handler.misc, job_cache=None):
        return hi.Job(get_surface_data, {'surface_uri': surface_uri})