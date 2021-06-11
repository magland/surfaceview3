from setuptools import setup, find_packages

setup(
    packages=find_packages(),
    scripts=[
        'bin/surfaceview3-start-backend'
    ],
    install_requires=[
        'click',
        'hither'
    ]
)

# jinjaroot synctool exclude