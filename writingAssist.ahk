#Requires AutoHotkey v2.0

; Replace "" with proper German quotes („ and “)
:*:_""::„“
:*:?""::\"\"
:*:_bold::<bold></bold>
:*:_abbr::<abbr title=''></abbr>

:*:_br::<br>"],`n["
:*:_vis::"],`n["
:*:_app::,`n[""]
:*:_capp::,`n["cid", ""]
:*:_cfit::"]]],`n["cid", ""],`n["",[`n["

:*:_splitchap::"]]],`n["cid", ""]],`n"":[`n["",[`n["

:*:_clink::"],`n["", "clink", "?c="],`n["
:*:_name::"],`n["", "emqjeciv"],`n["
:*:_trans::"],`n["", "emqjeciv translate"],`n["

:*:_elfit::]],`n["",[`n[""]]],`n["",[
:*:_elput::"]]],`n["",[`n[""]]],`n["",[`n["

:*:_chapfit::`n"": [`n["h2",[`n[""]]],`n["span",[`n[""]]]],
:*:_chapnew::,`n"": [`n["h2",[`n[""]]],`n["span",[`n[""]]]]
