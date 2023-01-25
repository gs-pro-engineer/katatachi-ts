all: test

venv:
		python3 -m venv venv

deps: venv
		./venv/bin/python -m pip install --upgrade pip setuptools wheel
		./venv/bin/python setup.py develop

test: venv
		./venv/bin/python setup.py test
