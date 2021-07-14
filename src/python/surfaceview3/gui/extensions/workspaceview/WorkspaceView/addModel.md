A *model* in surfaceview3 comprises a collection of surfaces and 3D vector fields that live in the same 3D space.

To add a model to this workspace, run a Python script on the computer running the backend service.

An example for loading some vector fields from a Python .pickle file:

```python
import surfaceview3
import kachery_client as kc

# Set workspace_uri
workspace_uri = '{workspaceUri}'

################################################################
# Set pkl_fname
# This example is specific to the CCM setup
datadir = '/mnt/ceph/users/mrachh/miniwasp_data'

# model_name = 'iref0_iomega1_icase2_idir1_ipol1'
# model_name = 'iref1_iomega2_icase2_idir1_ipol1'
# model_name = 'iref1_iomega2_icase2_idir1_ipol2'
# model_name = 'iref1_iomega3_icase2_idir1_ipol1'
# model_name = 'iref1_iomega3_icase2_idir1_ipol2'
# model_name = 'iref1_iomega4_icase2_idir1_ipol1'
# model_name = 'iref1_iomega4_icase2_idir1_ipol2'
# model_name = 'iref1_iomega2_icase2_idir1_ipol1_idis0'
# model_name = 'iref1_iomega2_icase2_idir1_ipol1_idis1'
model_name = 'iref1_iomega2_icase2_idir1_ipol1_idis2'

pkl_fname = f'{datadir}/pickle_{model_name}.pickle'
x = kc.load_pkl(pkl_fname)
if not x:
    raise Exception(f'Problem loading: {pkl_fname}')
################################################################

xgrid = x['xgrid']
ygrid = x['ygrid']
zgrid = x['zgrid']
H = x['H'].reshape((3, len(xgrid), len(ygrid), len(zgrid)), order='C')
E = x['E'].reshape((3, len(xgrid), len(ygrid), len(zgrid)), order='C')
eccentricity_E =x['eccentricity_E'].reshape((1, len(xgrid), len(ygrid), len(zgrid)), order='C')
intensity_E = x['intensity_E'].reshape((1, len(xgrid), len(ygrid), len(zgrid)), order='C')

H0 = surfaceview3.VectorField3D.from_numpy(xgrid=xgrid, ygrid=ygrid, zgrid=zgrid, values=H)
E0 = surfaceview3.VectorField3D.from_numpy(xgrid=xgrid, ygrid=ygrid, zgrid=zgrid, values=E)
eccentricity_E0 = surfaceview3.VectorField3D.from_numpy(xgrid=xgrid, ygrid=ygrid, zgrid=zgrid, values=eccentricity_E)
intensity_E0 = surfaceview3.VectorField3D.from_numpy(xgrid=xgrid, ygrid=ygrid, zgrid=zgrid, values=intensity_E)

M = surfaceview3.Model(model_name)
M.add_vector_field_3d('H', H0)
M.add_vector_field_3d('E', E0)
M.add_vector_field_3d('eccentricity_E', eccentricity_E0)
M.add_vector_field_3d('intensity_E', intensity_E0)

# Load the workspace and add the model
W = surfaceview3.load_workspace(workspace_uri)
W.add_model(M)
```

An example for loading a surface, which requires access to a .vtk file in unstructured grid format:

```python
import surfaceview3

# Define the new model
M = surfaceview3.Model('model1')
s = surfaceview3.Surface.from_vtk_unstructured_grid('sha1://c5860c1d68f08635baac933bfa63160138a9097a/surf.vtk')
M.add_surface('surface1', s)

# Load the workspace and add the model
W = surfaceview3.load_workspace('{workspaceUri}')
W.add_model(M)
```

Here is an example script that assumes you have a URI for the serialized model:

```python
import surfaceview3

# Load the model to be added
M = surfaceview3.Model.deserialize('sha1://..../model.json', label='model1')

# Load the workspace and add the model
W = surfaceview3.load_workspace('{workspaceUri}')
W.add_model(M)
```

In the context of the miniwasp project, you can generate a URI for a new model by running one of the [examples found here](https://github.com/magland/surfaceview3/tree/main/devel/miniwasp_examples). That will print a model URI to the console and you can use the above script to add the model to the workspace.