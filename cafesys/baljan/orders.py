# -*- coding: utf-8 -*-
from baljan.models import Order, OrderGood
from django.utils.translation import ugettext_lazy as _
from datetime import date, datetime
from django.conf import settings
from django.contrib.auth.models import User, Group
from baljan.util import get_logger
from baljan.pseudogroups import was_worker, was_board
from dateutil.relativedelta import relativedelta

log = get_logger('baljan.orders')
prelog = get_logger('baljan.orders.pre')
rebatelog = get_logger('baljan.orders.rebate')

class Processed(object):
    default_reason = _("The order was processed.") 

    def __init__(self, preorder, reason=None):
        self.preorder = preorder
        self.reason = self.default_reason if reason is None else reason

    def accepted(self):
        raise NotImplementedError()

    def create_order_and_update_balance(self):
        raise NotImplementedError()


class Denied(Processed):
    default_reason = _("The order was denied.")

    def accepted(self):
        return False


class Accepted(Processed):
    default_reason = _("The order was accepted.")

    def accepted(self):
        return True

    def create_order_and_update_balance(self):
        preorder = self.preorder

        paid, cur = preorder.costcur()
        order = Order(
            put_at=preorder.put_date,
            user=preorder.user,
            paid=paid,
            currency=cur,
            accepted=True)
        order.save()

        profile = preorder.user.get_profile()
        profile.balance -= paid
        assert profile.balance_currency == cur
        profile.save()

        for good, count in preorder.goods:
            og = OrderGood(
                    order=order,
                    good=good,
                    count=count)
            og.save()

        log.info('created order %r' % order)


class PreOrder(object):
    class Error(Exception):
        pass

    @staticmethod
    def from_group(user, goods, put_date=None):
        if put_date is None:
            put_date = date.today()

        using_cls = DefaultPreOrder
        groups = user.groups.all()
        for member_func, cls in [
                (was_board, BoardPreOrder),
                (was_worker, WorkerPreOrder),
                ]:
            if member_func(user, put_date):
                using_cls = cls
                break

        prelog.info('using %r for %r' % (using_cls, user))
        return using_cls(user, goods, put_date)

    def __init__(self, user, goods, put_date=None):
        """The goods argument must look like

            [(<Good object>, 1),
             (<Good object>, 2),
             (<Good object>, 1)]

            where the second value in the tuples are 
            counts.
        """
        self.user = user
        self.goods = goods
        if put_date is None:
            self.put_date = date.today()
        else:
            self.put_date = put_date

    def _raw_costcur(self):
        if len(self.goods) == 0:
            raise self.Error('no goods')

        cost = 0
        cur = self.goods[0][0].costcur(self.put_date)[1]
        for good, count in self.goods:
            this_cost, this_cur = good.costcur(self.put_date)
            if cur != this_cur:
                raise self.Error('goods must have the same currency') 
            cost += this_cost * count
        return cost, cur

    def _polished_costcur(self):
        """Override in subclasses to provide rebates for certain groups of
        users."""
        raise NotImplementedError()

    def costcur(self):
        return self._polished_costcur()


class FreePreOrder(PreOrder):
    def _polished_costcur(self): 
        raw_cost, cur = self._raw_costcur()
        rebatelog.info('%d %s rebate for %r (free)' % (raw_cost, cur, self.user))
        return (0, cur)


class BoardPreOrder(PreOrder):
    def _polished_costcur(self): 
        raw_cost, cur = self._raw_costcur()
        rebatelog.info('%d %s rebate for %r (board)' % (raw_cost, cur, self.user))
        return (0, cur)


class WorkerPreOrder(PreOrder):
    def _polished_costcur(self): 
        raw_cost, cur = self._raw_costcur()
        cooldown = settings.WORKER_COOLDOWN_SECONDS

        start, end = self.put_at - relativedelta(seconds=cooldown), self.put_at
        recent_orders = Order.objects.filter(
                user=self.user,
                put_at__gte=start,
                put_at__lte=end,
        )
        if len(recent_orders):
            in_cooldown = False
            for recent_order in recent_orders:
                this_cost, this_cur = recent_order.costcur()
                if cur != this_cur:
                    in_cooldown = True
                    break
                if this_cost < raw_cost:
                    in_cooldown = True
                    break
        else:
            in_cooldown = False

        if in_cooldown:
            rebatelog.info('no rebate because of cooldown for %r (worker)' % self.user)
            cost = raw_cost
        else:
            cost = max(0, raw_cost - settings.WORKER_MAX_COST_REDUCTION)
            rebatelog.info('%d %s rebate for %r (worker)' % (
                raw_cost - cost, cur, self.user))

        return (cost, cur)


class DefaultPreOrder(PreOrder):
    def _polished_costcur(self):
        rebatelog.debug('no rebate for %r' % self.user)
        return self._raw_costcur()


class Clerk(object):
    def process(self, preorder):
        user = preorder.user
        profile = user.get_profile()
        balance = profile.balance
        balance_currency = profile.balance_currency

        cost, cur = preorder.costcur()
        if cur != balance_currency:
            return Denied(preorder, _("Mixed currencies."))
        elif balance < cost:
            return Denied(preorder, _("Insufficient funds."))
        else:
            accepted =  Accepted(preorder)
            accepted.create_order_and_update_balance()
            return accepted
