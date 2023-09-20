#!/usr/bin/env python
# coding=utf-8
"""
 *		FilePath: Travelbefore.py
 *		Description: 
 *		Date: 2023-04-10 19:11:26
 *		LastEditors: wuweipeng@baidu.com
"""

import numpy as np
import base64

from http import HTTPStatus
from dashscope import Generation


class TravelBefore(object):
    """TravelBefore """
    def __init__(self):
        pass

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
