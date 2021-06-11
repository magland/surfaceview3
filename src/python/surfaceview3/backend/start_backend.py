import kachery_client as kc

def start_backend(*, channel: str):
    # register the tasks
    from ..tasks import dummy
    from ..gui.extensions import dummy

    kc.run_task_backend(
        channels=[channel],
        task_function_ids=[
            'workspace_list_subfeed.2', 'get_model_info.8', 'get_surface_data.6', 'get_vector_field_3d_info.1', 'get_vector_field_3d_slice_data.3'
        ]
    )