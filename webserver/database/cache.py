from typing import List
import time
import logging

import redis

from .image_model import ImageModel
from .postgresql import Database

cache = redis.Redis(host="redis", port=6379)

""" Cache Structure
  key             |       Type     |   Data Format   |  Example (key: value)
------------------+----------------+-----------------+---------------------------------------------------
 images:file_list |  Set           | filename        | images:file_list: 8f9478cbf3182768.jpg
 images:working   |  Set           | filename_style  | images:working: 8f9478cbf3182768.jpg_cartoongan_hayao
 style            |  Array(String) | [filename]      | cartoongan_hayao: [8f9478cbf3182768.jpg, 8f9478cbf3182768.jpg, ...]

"""


class Cache:
    file_list_key = "images:file_list"
    working_key = "images:working"
    LOGGER = logging.getLogger("database.cache")

    @classmethod
    def __init__(cls):
        cls.LOGGER.debug("Cache init!")
        # cls.load_db() # DB에 저장된 이미지를 캐시로 불러온다

    @classmethod
    def add_all_db_data(cls, all_data_in_db: List[ImageModel]):
        exist_data_in_storage = Database.sync_image_models()  # storage에서 db에 담은 정보. 이제 캐시에 넣자
        cache.sadd(
            cls.file_list_key, *list(map(lambda x: x[0], exist_data_in_storage))
        )  # FIXME: list로 감싸야하는지 확실하지 않음
        [cache.sadd(style, filename) for [filename, style] in exist_data_in_storage]

    @classmethod
    def exist_image(cls, filename: str):
        result = bool(cache.sismember(cls.file_list_key, filename))
        if result:
            cls.LOGGER.debug("Image does not exist in cache.")
            cls.LOGGER.debug("Save image %s" % filename)
        return result

    @classmethod
    def exist_output_image(cls, filename: str, style: str):
        result = bool(cache.sismember(style, filename))
        if result:
            cls.LOGGER.debug("Output image exists in cache. Response input filename")
        return result

    @classmethod
    def exist_working(cls, filename: str, style: str):
        result = bool(cache.sismember(cls.working_key, cls.working_job_name(filename, style)))
        if result:
            cls.LOGGER.debug("Job in queue already. {}, {}".format(filename, style))
        return result

    @classmethod
    def load_db(cls):
        Database.sync_image_models()  # DB를 storage와 동기화
        all_data_in_db = ImageModel.query.all()
        print("all_data_in_db: {}".format(all_data_in_db))
        if not all_data_in_db:
            return
        cls.add_all_db_data(all_data_in_db)  # Cache를 DB와 동기화
        cls.LOGGER.debug("Image list: {}".format(cache.smembers(cls.file_list_key)))
        cls.LOGGER.info("Caching image files from DB Done")

    @classmethod
    def put_working(cls, filename: str, style: str):
        cache.sadd(cls.working_key, cls.working_job_name(filename, style))
        cls.LOGGER.debug("Add job in queue. {}, {}".format(filename, style))

    @classmethod
    def wait_for_image(cls, filename: str, style: str):
        cls.LOGGER.debug("CALL wait for image")
        count = 0
        try:
            while count < 100:  # 100초
                if cls.exist_output_image(filename, style):
                    time.sleep(2.5)  # sync file in docker containers
                    return
                count += 1
                time.sleep(1)
        except TimeoutError as timeout_err:
            cls.LOGGER.error("Timeout : %s, %s", filename, style)
            raise TimeoutError from timeout_err

    @classmethod
    def working_job_name(cls, filename: str, style: str):
        return "_".join([filename, style])
