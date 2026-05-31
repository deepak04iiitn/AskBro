"""Convert Notion page blocks to Markdown."""


def _rich_text(rt: list) -> str:
    out = ""
    for chunk in rt:
        t = chunk.get("plain_text", "")
        a = chunk.get("annotations", {})
        if a.get("code"):
            t = f"`{t}`"
        elif a.get("bold") and a.get("italic"):
            t = f"***{t}***"
        elif a.get("bold"):
            t = f"**{t}**"
        elif a.get("italic"):
            t = f"*{t}*"
        elif a.get("strikethrough"):
            t = f"~~{t}~~"
        href = chunk.get("href")
        if href:
            t = f"[{t}]({href})"
        out += t
    return out


def block_to_md(block: dict, depth: int = 0) -> str:
    btype = block.get("type", "")
    data  = block.get(btype, {})
    rt    = data.get("rich_text", [])
    text  = _rich_text(rt)
    pad   = "  " * depth

    if btype == "heading_1":           return f"# {text}"
    if btype == "heading_2":           return f"## {text}"
    if btype == "heading_3":           return f"### {text}"
    if btype == "paragraph":           return text
    if btype == "bulleted_list_item":  return f"{pad}- {text}"
    if btype == "numbered_list_item":  return f"{pad}1. {text}"
    if btype == "to_do":
        box = "x" if data.get("checked") else " "
        return f"{pad}- [{box}] {text}"
    if btype == "quote":               return f"> {text}"
    if btype == "callout":
        emoji = data.get("icon", {}).get("emoji", "")
        return f"> {emoji} {text}"
    if btype == "divider":             return "---"
    if btype == "toggle":              return f"**{text}**"
    if btype == "code":
        lang = data.get("language", "")
        code = _rich_text(data.get("rich_text", []))
        return f"```{lang}\n{code}\n```"
    return text  # unsupported block — return plain text


def page_title(page: dict) -> str:
    try:
        for val in page.get("properties", {}).values():
            if val.get("type") == "title":
                return _rich_text(val.get("title", [])) or "Untitled"
    except Exception:
        pass
    return "Untitled"


def extract_page_id(url: str) -> str | None:
    """Extract 32-char page ID from any Notion URL format."""
    import re
    clean = url.split("?")[0].split("#")[0].rstrip("/")
    # UUID format: xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
    m = re.search(
        r"([a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12})",
        clean, re.I,
    )
    if m:
        return m.group(1).replace("-", "")
    # 32-char hex at end
    m = re.search(r"([a-f0-9]{32})$", clean, re.I)
    if m:
        return m.group(1)
    return None
