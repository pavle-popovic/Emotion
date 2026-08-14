import enum
from datetime import datetime, timezone
from typing import Optional

from sqlalchemy import DateTime, Enum, ForeignKey, String, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from .base import Base


class SubscriptionTier(str, enum.Enum):
    """E-motion sells one membership: EUR 29/month unlocks everything.

    Modelled as a ranked ladder anyway so a second paid tier can be added later
    without touching gating logic or reshaping the column.
    """

    FREE = "free"
    MEMBER = "member"


# Higher rank unlocks everything below it. Keep this the single source of truth
# for ordering - never compare tiers by string.
TIER_RANK: dict["SubscriptionTier", int] = {
    SubscriptionTier.FREE: 0,
    SubscriptionTier.MEMBER: 1,
}


class SubscriptionStatus(str, enum.Enum):
    TRIALING = "trialing"
    ACTIVE = "active"
    PAST_DUE = "past_due"
    CANCELED = "canceled"


# past_due is deliberately included: Stripe keeps retrying a failed payment for
# days, and locking someone out mid-dunning churns people who would have paid.
_ACCESS_GRANTING = {
    SubscriptionStatus.TRIALING,
    SubscriptionStatus.ACTIVE,
    SubscriptionStatus.PAST_DUE,
}


class Subscription(Base):
    __tablename__ = "subscriptions"

    id: Mapped[int] = mapped_column(primary_key=True)
    user_id: Mapped[int] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"), unique=True, index=True
    )
    tier: Mapped[SubscriptionTier] = mapped_column(
        Enum(SubscriptionTier), default=SubscriptionTier.FREE, nullable=False
    )
    status: Mapped[SubscriptionStatus] = mapped_column(
        Enum(SubscriptionStatus), default=SubscriptionStatus.ACTIVE, nullable=False
    )
    # Null means "no expiry known" (e.g. a manually granted tier), which counts
    # as current. Stripe fills this in once billing is wired.
    current_period_end: Mapped[Optional[datetime]] = mapped_column(
        DateTime(timezone=True), nullable=True
    )
    stripe_customer_id: Mapped[Optional[str]] = mapped_column(String(255), nullable=True, index=True)
    stripe_subscription_id: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())

    user = relationship("User", back_populates="subscription")

    @property
    def is_current(self) -> bool:
        if self.current_period_end is None:
            return True
        return self.current_period_end > datetime.now(timezone.utc)

    @property
    def grants_access(self) -> bool:
        return self.status in _ACCESS_GRANTING and self.is_current

    @property
    def effective_tier(self) -> SubscriptionTier:
        return self.tier if self.grants_access else SubscriptionTier.FREE
