import enum


class DanceStyle(str, enum.Enum):
    """The four styles E-motion teaches, plus a bucket for cross-style courses."""

    HIP_HOP = "hip_hop"
    KIZOMBA = "kizomba"
    BACHATA = "bachata"
    AFROBEATS = "afrobeats"
    ALL_STYLES = "all_styles"


STYLE_LABELS: dict[DanceStyle, str] = {
    DanceStyle.HIP_HOP: "Hip hop",
    DanceStyle.KIZOMBA: "Kizomba",
    DanceStyle.BACHATA: "Bachata",
    DanceStyle.AFROBEATS: "Afrobeats",
    DanceStyle.ALL_STYLES: "All styles",
}


def label_for(style: DanceStyle) -> str:
    return STYLE_LABELS[style]
