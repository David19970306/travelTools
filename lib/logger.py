#!/usr/bin/env python
# coding=utf-8
import logging
import os
from logging.handlers import TimedRotatingFileHandler
LOG_FORMAT = "%(asctime)s (%(name)s) [%(levelname)s] %(message)s"
DATE_FORMAT = "%m/%d/%Y %H:%M:%S"
class Log:
    """Log"""
    def __init__(self, name, path='./', level=logging.INFO):
        '''
        initialize logger, default output level is Warning
        :param name: logger programe name
        :param path: logs path to be save
        :param is_save: whether save logs to file
        :param level: file_log level, default DEBUG
        '''
        logging.basicConfig(format=LOG_FORMAT, datefmt=DATE_FORMAT, level=level)
        self.logger = logging.getLogger(name)  # 程序名
        log_formatter = logging.Formatter(LOG_FORMAT)
        # 按1小时备份48份
        log_when = 'h'
        log_interval = 1
        log_backupCount = 48
        # info日志处理器
        if not os.path.exists(path):
            os.makedirs(path)
        info_handler = TimedRotatingFileHandler(filename=os.path.join(path, name + '.log'),
            when=log_when, interval=log_interval, backupCount=log_backupCount, encoding='utf-8')
        info_handler.setLevel(logging.INFO)
        info_handler.setFormatter(log_formatter)
        self.logger.addHandler(info_handler)

    def debug(self, msg, *args):
        """debug """
        msg = str(msg)
        for arg in args:
            msg += ' ' + str(arg)
        self.logger.debug(msg)

    def info(self, msg, *args):
        """info """
        msg = str(msg)
        for arg in args:
            msg += ' ' + str(arg)
        self.logger.info(msg)

    def warning(self, msg, *args):
        """warning """
        msg = str(msg)
        for arg in args:
            msg += ' ' + str(arg)
        self.logger.warning(msg)

    def error(self, msg, *args):
        """ error"""
        msg = str(msg)
        for arg in args:
            msg += ' ' + str(arg)
        self.logger.error(msg)