import numpy as np
import hither2 as hi
import kachery_client as kc
import surfaceview2
from surfaceview2.config import job_cache, job_handler
from surfaceview2.workspace_list import WorkspaceList
import kachery_client as kc

@hi.function('get_model_info', '0.1.8')
def get_model_info(model_uri: str):
    model_object = kc.load_json(model_uri)
    if not model_object:
        raise Exception(f'Unable to load object: {model_object}')
    E = surfaceview2.Model.deserialize(model_object, label='')
    ret = {
        'surfaces': {},
        'vectorfield3ds': {}
    }
    for name in E.surface_names:
        s = E.get_surface(name)
        ret['surfaces'][name] = {
            'numVertices': s.num_vertices,
            'numFaces': s.num_faces,
            'uri': kc.store_json(s.serialize())
        }
    for name in E.vector_field_3d_names:
        v = E.get_vector_field_3d(name)
        ret['vectorfield3ds'][name] = {
            'uri': kc.store_json(v.serialize()),
            'nx': len(v.xgrid),
            'ny': len(v.ygrid),
            'nz': len(v.zgrid),
            'dim': v.values.shape[0],
            'valueRange': {'min': np.min(v.values.real), 'max': np.max(v.values.real)}
        }
    return ret

@kc.taskfunction('get_model_info.8', type='pure-calculation')
def task_get_model_info(model_uri: str):
    with hi.Config(job_handler=job_handler.misc, job_cache=job_cache):
        return hi.Job(get_model_info, {'model_uri': model_uri})