from typing import Union, cast

import kachery_client as kc
import numpy as np

class VectorField3D:
    def __init__(self, arg: Union[dict, str]):
        if isinstance(arg, str):
            x = kc.load_json(arg)
            if not x:
                raise Exception(f'Unable to load: {arg}')
            arg = cast(dict, x)
        self._load(arg)
        self._arg = arg
    def serialize(self):
        return self._arg
    @property
    def xgrid(self) -> np.ndarray:
        return self._xgrid
    @property
    def affine_transformation(self) -> np.ndarray:
        x0 = self._xgrid[0]
        y0 = self._ygrid[0]
        z0 = self._zgrid[0]
        dx = self._xgrid[1] - self._xgrid[0]
        dy = self._ygrid[1] - self._ygrid[0]
        dz = self._zgrid[1] - self._zgrid[0]
        return np.array([
            [dx, 0, 0, x0],
            [dy, 0, 0, y0],
            [dz, 0, 0, z0]
        ])
    @property
    def ygrid(self) -> np.ndarray:
        return self._ygrid
    @property
    def zgrid(self) -> np.ndarray:
        return self._zgrid
    @property
    def dim(self) -> int:
        return self._values.shape[0]
    @property
    def values(self) -> np.ndarray:
        return self._values
    def _load(self, arg: dict):
        format = arg.get('vectorfield3d_format')
        data = arg.get('data', {})
        if format == 'pkl_v1':
            pkl_uri = data['pkl_uri']
            x = kc.load_pkl(pkl_uri)
            if x is None:
                raise Exception(f'Unable to load: {pkl_uri}')
            self._xgrid = x['xgrid']
            self._ygrid = x['ygrid']
            self._zgrid = x['zgrid']
            self._values = x['values']
        else:
            raise Exception(f'Unexpected vector3d format: {format}')
    @staticmethod
    def from_numpy(*, xgrid: np.ndarray, ygrid: np.ndarray, zgrid: np.ndarray, values: np.ndarray):
        assert values.ndim == 4
        assert values.shape[1] == len(xgrid)
        assert values.shape[2] == len(ygrid)
        assert values.shape[3] == len(zgrid)
        return VectorField3D({
            'vectorfield3d_format': 'pkl_v1',
            'data': {
                'pkl_uri': kc.store_pkl({
                    'xgrid': xgrid,
                    'ygrid': ygrid,
                    'zgrid': zgrid,
                    'values': values
                })
            }
        })