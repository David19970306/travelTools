#!/bin/bash
export DASHSCOPE_API_KEY=xxxxx  # use the tongyiqianwen key
gunicorn -c configs/gunicorn.conf travel_server:app