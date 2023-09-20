#!/usr/bin/env python
# coding=utf-8
"""
 *		FilePath: travel_server.py
 *		Description: 
 *		Date: 2023-04-10 19:08:01
 *		LastEditors: wuweipeng@baidu.com
"""
from flask import Flask
import flask.scaffold
flask.helpers._endpoint_from_view_func = flask.scaffold._endpoint_from_view_func
from flask_restful import Api

from models.travelbefore import TravelBefore

app = Flask(__name__)
api = Api(app)
# Route URL to resource
api.add_resource(TravelBefore, '/travel_before')
if __name__ == '__main__':
    app.run(debug=True)