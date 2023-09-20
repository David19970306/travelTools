#!/usr/bin/env python
# coding=utf-8
"""
 *		FilePath: Travelbefore.py
 *		Description: 
 *		Date: 2023-04-10 19:11:26
 *		LastEditors: wuweipeng@baidu.com
"""

import io
import os
import yaml
from flask import request
from flask_restful import Resource
import time
import json
import numpy as np
import base64

import sys
sys.path.append("../lib")
from lib.logger import Log

from http import HTTPStatus
from dashscope import Generation


BASE_PATH = os.path.realpath('./') # 获取当前工作目录
config_path = os.path.join(BASE_PATH, 'configs/config.yml')
log_path = os.path.join(BASE_PATH, 'logs')
with open(config_path, 'r') as f:
    cfg = yaml.safe_load(f)
logger = Log('TravelBefore', log_path)

class TravelBefore(Resource):
    """TravelBefore """
    LogTitle = "[TravelBefore]"
    def get(self):
        """doing the get request"""
        return self.data_dict(cfg['RESULTCODE']['SUCC'], "succ", "Welcome to TravelBefore", time.strftime("%Y-%m-%d %X"))
    
    def post(self):
        """doing the post request"""
        start_time = time.time()
        try:
            logger.info("%s starting !" % self.LogTitle)
            datas = json.loads(request.data)
            # 解析 request 数据
            text = datas['text']
            respFirst, respSecond = self.predict(text)
            logger.info("%s result: %s, %s!" % (self.LogTitle, str(respFirst), str(respSecond)))
            return self.data_dict(cfg['RESULTCODE']['SUCC'], "succ", respFirst, time.time() - start_time)

        except Exception as err:
            logger.error("The something fail occurs: %s" % str(err))
            return self.data_dict(cfg['RESULTCODE']['ERROR'], "fail", str(err), time.time() - start_time)

    def predict(self, text):
        """ predict """
        resp=Generation.call(
            model='qwen-turbo',
            prompt=text
        )
        # The response status_code is HTTPStatus.OK indicate success,
        # otherwise indicate request is failed, you can get error code
        # and message from code and message.
        if resp.status_code == HTTPStatus.OK: 
            print(resp.output) # The output text
            print(resp.usage)  # The usage information
            return resp.output["text"], resp.usage

        return resp.code, resp.message

    def postprocessing(self, text):
        """ postprocessing"""
        return text

    def preprocessing(self, text):
        """ preprocessing"""
        return text

    def data_dict(self, code, message, data, cost_time):
        """ dict the data """
        body = {
            "code": int(code),
            "message": str(message),
            "data": data,
            "time": cost_time,
        }
        return body
    