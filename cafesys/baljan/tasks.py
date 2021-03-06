# -*- coding: utf-8 -*-
from celery import shared_task
from django.conf import settings
from django.core.cache import cache

from . import stats


@shared_task
def update_stats():
    s = stats.Stats()
    data = [s.get_interval(i) for i in stats.ALL_INTERVALS]
    cache.set(settings.STATS_CACHE_KEY, data, settings.STATS_CACHE_TTL)
