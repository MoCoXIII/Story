# jsonFormat.py

import json
import re

with open("dergrund.json", encoding="utf-8") as f:
    data = f.read()

# the json is built like this:
# {
#     "chapterID": [
#         ["element",[
#             ["text", "classes", "link"],
#             ["text", "classes", "link"]
#     ]]]
# }
# we do not want to split it up any further, it's most readable this way

searches = [
    r"(?<=\])[ \n]*(?=\])",
    r"(?<=\,)[ \n]{6,}(?=\")",
    r"(?<=\")[ \n]*(?=\])",
    r"(?<=\[)[ \n]*(?=\")",
    r"(?<=(?<!\])\,)[ \n]*(?=\[)",
    r" {16}"
]
replacements = [
    r"",
    r" ",
    r"",
    r"",
    r"",
    r"            "
]

for search, replacement in zip(searches, replacements):
    data = re.sub(search, replacement, data)

with open("dergrund.json", "w", encoding="utf-8") as f:
    f.write(data)
