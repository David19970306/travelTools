#!/usr/bin/env python
# coding=utf-8
import requests
import time
import json
import base64
import io
import unittest

class RequestUnitTest(unittest.TestCase):
    """RequestUnitTest"""
    def setUp(self):
        self.api_url = "http://127.0.0.1:8765/travel_before"
    
    def test_req(self):
        """test the post func."""
        postdata = {'text': "胡萝卜的做法🥕"}
        model_result = requests.post(self.api_url, data=json.dumps(postdata)).json()
        self.assertEqual(model_result['data'], "")
# 使用注意，在初始化的时候（第一次使用的时候速度较慢，在第二次使用则恢复正常，在4ms左右）
if __name__ == '__main__':
    unittest.main()