import numpy as np
import hither2 as hi
import kachery_client as kc
import surfaceview3
from surfaceview3.config import job_cache, job_handler
from surfaceview3.workspace_list import WorkspaceList

@hi.function('get_vector_field_3d_info', '0.1.0')
def get_vector_field_3d_info(vector_field_3d_uri: str):
    V = surfaceview3.VectorField3D(vector_field_3d_uri)
    return dict({
        'xgrid': V.xgrid.astype(np.float32),
        'ygrid': V.ygrid.astype(np.float32),
        'zgrid': V.zgrid.astype(np.float32),
        'dim': V.values.shape[0]
    })

@kc.taskfunction('get_vector_field_3d_info.1', type='pure-calculation')
def task_get_vector_field_3d_info(vector_field_3d_uri: str):
    with hi.Config(job_handler=job_handler.misc, job_cache=None):
        return hi.Job(get_vector_field_3d_info, {'vector_field_3d_uri': vector_field_3d_uri})