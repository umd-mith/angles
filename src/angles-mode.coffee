###
 ***** BEGIN LICENSE BLOCK *****
 * Distributed under the BSD license:
 *
 * Copyright (c) 2012, Ajax.org B.V.
 * All rights reserved.
 *
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions are met:
 *     * Redistributions of source code must retain the above copyright
 *       notice, this list of conditions and the following disclaimer.
 *     * Redistributions in binary form must reproduce the above copyright
 *       notice, this list of conditions and the following disclaimer in the
 *       documentation and/or other materials provided with the distribution.
 *     * Neither the name of Ajax.org B.V. nor the
 *       names of its contributors may be used to endorse or promote products
 *       derived from this software without specific prior written permission.
 *
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND
 * ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
 * WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
 * DISCLAIMED. IN NO EVENT SHALL AJAX.ORG B.V. BE LIABLE FOR ANY
 * DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
 * (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
 * LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND
 * ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
 * (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
 * SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 *
 * ***** END LICENSE BLOCK *****
###

if define?
  define 'ext/angles', [
    'require'
    'exports'
    'module'
    'ace/snippets'
    'ace/autocomplete'
    'ace/config'
    'ace/autocomplete/text_completer'
    'ace/editor'
  ], (require, exports, module) ->

    snippetManager = require("ace/snippets").snippetManager
    Autocomplete = require("ace/autocomplete").Autocomplete
    config = require("ace/config")

    textCompleter = require("ace/autocomplete/text_completer");
    keyWordCompleter =
      getCompletions: (editor, session, pos, prefix, callback) ->
        keywords = session.$mode.$keywordList || []
        keywords = keywords.filter (w) -> w.lastIndexOf(prefix, 0) == 0

        callback null, keywords.map (word) ->
          {
            name: word
            value: word
            score: 0
            meta: "keyword"
          }

    snippetCompleter =
      getCompletions: (editor, session, pos, prefix, callback) ->
        scope = snippetManager.$getScope(editor)
        snippetMap = snippetManager.snippetMap
        completions = []
        [scope, "_"].forEach (scope) =>
          snippets = snippetMap[scope] || []
          for i in [snippets.length-1..0]
            s = snippets[i]
            if s.tabTrigger and s.tabTrigger.indexOf(prefix) == 0
              completions.push
                caption: s.tabTrigger
                snippet: s.content
                meta: "snippet"

        callback null, completions


    completers = [snippetCompleter, textCompleter, keyWordCompleter]
    exports.addCompleter = (completer) -> completers.push completer

    expandSnippet = 
      name: "expandSnippet"
      exec: (editor) ->
          success = snippetManager.expandWithTab(editor)
          if not success
              editor.execCommand("indent")
      bindKey: "tab"

    onChangeMode = (e, editor) ->
      mode = editor.session.$mode
      id = mode.$id
      if not snippetManager.files
        snippetManager.files = {}
      if id and not snippetManager.files[id]
        snippetFilePath = id.replace("mode", "snippets")
        config.loadModule snippetFilePath, (m) ->
          if m 
            snippetManager.files[id] = m
            m.snippets = snippetManager.parseSnippetFile(m.snippetText)
            snippetManager.register(m.snippets, m.scope)

    Editor = require("ace/editor").Editor
    require("ace/config").defineOptions Editor.prototype, "editor",
      enableBasicAutocompletion:
        set: (val) ->
          if val
            @completers = completers
            @commands.addCommand(Autocomplete.startCommand)
          else
            @commands.removeCommand(Autocomplete.startCommand)
        value: false

      enableODDAutocompletion:
        set: (val) ->
          if val
            @completers = completers
            @commands.addCommand(Autocomplete.startCommand)
          else
            @commands.removeCommand(Autocomplete.startCommand)
        value: false

      enableSnippets:
        set: (val) ->
          if val
            @commands.addCommand(expandSnippet)
            @on("changeMode", onChangeMode)
            onChangeMode null, @
          else
            @commands.removeCommand(expandSnippet)
            @off("changeMode", onChangeMode)
        value: false

  define 'ace/snippets', [
    'require'
    'exports'
    'module'
    'ace/lib/lang'
    'ace/range'
    'ace/keyboard/hash_handler'
    'ace/tokenizer'
    'ace/lib/dom'
  ], (require, exports, module) ->

    lang = require("./lib/lang")
    Range = require("ace/range").Range
    HashHandler = require("./keyboard/hash_handler").HashHandler
    Tokenizer = require("./tokenizer").Tokenizer
    comparePoints = Range.comparePoints

    class SnippetManager
      constructor: ->
        @snippetMap = {}
        @snippetNameMap = {}
        @variables = {}

      getTokenizer: ->
        TabstopToken = (str, _, stack) ->
          str = str.substr(1)
          if /^\d+$/.test(str) and not stack.inFormatString
            [{tabstopId: parseInt(str, 10)}]
          else
            [{text: str}]

        escape = (ch) ->
          "(?:[^\\\\" + ch + "]|\\\\.)"

        SnippetManager.$tokenizer = new Tokenizer
          start: [
            {
              regex: /:/
              onMatch: (val, state, stack) ->
                if stack.length and stack[0].expectIf
                  stack[0].expectIf = false
                  stack[0].elseBranch = stack[0]
                  [stack[0]]
                else
                  ":"
            },
            {
              regex: /\\./
              onMatch: (val, state, stack) ->
                ch = val[1]
                switch
                  when ch == "}" and stack.length
                    val = ch
                  when "`$\\".indexOf(ch) != -1
                    val = ch
                  when stack.inFormatString
                    switch
                      when ch == "n"
                        val = "\n"
                      when ch == "t"
                        val = "\n"
                      when "ulULE".indexOf(ch) != -1
                        val = 
                          changeCase: ch
                          local: ch > "a"
                [val]
            },
            {
              regex: /\}/
              onMatch: (val, state, stack) ->
                [if stack.length then stack.shift() else val]
            },
            {
              regex: /\$(?:\d+|\w+)/
              onMatch: TabstopToken
            },
            {
              regex: /\$\{[\dA-Z_a-z]+/
              onMatch: (str, state, stack) ->
                t = TabstopToken(str.substr(1), state, stack)
                stack.unshift(t[0])
                t
              next: "snippetVar"
            },
            {
              regex: /\n/
              token: "newline"
              merge: false
            }
          ]
          snippetVar: [
            {
              regex: "\\|" + escape("\\|") + "*\\|"
              onMatch: (val, state, stack) ->
                stack[0].choices = val.slice(1, -1).split(",")
              next: "start"
            }
            {
              regex: "/(" + escape("/") + "+)/(?:(" + escape("/") + "*)/)(\\w*):?"
              onMatch: (val, state, stack) ->
                ts = stack[0]
                ts.fmtString = val

                val = @splitRegex.exec(val)
                ts.guard = val[1]
                ts.fmt = val[2]
                ts.flag = val[3]
                ""
              next: "start"
            }
            {
              regex: "`" + escape("`") + "*`"
              onMatch: (val, state, stack) ->
                stack[0].code = val.splice(1, -1)
                ""
              next: "start"
            }
            {
              regex: "\\?"
              onMatch: (val, state, stack) ->
                if stack[0]
                  stack[0].expectIf = true
              next: "start"
            }
            {
              regex: "([^:}\\\\]|\\\\.)*:?"
              token: ""
              next: "start"
            }
          ],
          formatString: [
            {
              regex: "/(" + escape("/") + "+)/"
              token: "regex"
            }
            {
              regex: ""
              onMatch: (val, state, stack) ->
                stack.inFormatString = true
              next: "start"
            }
          ]

        SnippetManager.prototype.getTokenizer = -> SnippetManager.$tokenizer
        SnippetManager.$tokenizer

      tokenizeTmSnippet: (str, startState) ->
        @getTokenizer().getLineTokens(str, startState).tokens.map (x) -> x.value or x

      $getDefaultValue: (editor, name) ->
        switch
          when /^[A-Z]\d+$/.test(name)
            i = name.substr(1)
            (@variables[name[0] + "__"] or {})[i]
          when /^\d+$/.test(name)
            (@variables.__ or {})[name]
          else
            name = name.replace(/^TM_/, "");

            return if not editor

            s = editor.session

            switch(name) 
              when "CURRENT_WORD"
                r = s.getWordRange()
              when "SELECTION", "SELECTED_TEXT"
                s.getTextRange(r)
              when "CURRENT_LINE"
                s.getLine(e.getCursorPosition().row)
              when "LINE_INDEX"
                e.getCursorPosition().column
              when "LINE_NUMBER"
                e.getCursorPosition().row + 1
              when "SOFT_TABS"
                if s.getUseSoftTabs() then "YES" else "NO"
              when "TAB_SIZE"
                s.getTabSize()
              when "FILENAME", "FILEPATH"
                "ace.ajax.org"
              when "FULLNAME"
                "Ace"
   
      getVariableValue: (editor, varName) ->
        if @variables.hasOwnProperty(varName)
          @variables[varName](editor, varName) or ""
        else
          @$getDefaultValue(editor, varName) or ""

      tmStrFormat: (str, ch, editor) ->
        flag = ch.flag or ""
        re = ch.guard
        re = new RegExp(re, flag.replace(/[^gi]/, ""))
        fmtTokens = @tokenizeTmSnippet(ch.fmt, "formatString")
        formatted = str.replace re, =>
          @variables.__ = arguments
          fmtParts = @resolveVariables(fmtTokens, editor)
          gChangeCase = "E"
          for i in [0...fmtParts.length]
            ch = fmtParts[i];
            switch
              when typeof ch == "object"
                fmtParts[i] = ""
                if ch.changeCase and ch.local
                  next = fmtParts[i + 1]
                  if next and typeof next == "string"
                    if ch.changeCase == "u"
                      fmtParts[i] = next[0].toUpperCase()
                    else
                      fmtParts[i] = next[0].toLowerCase()
                    fmtParts[i + 1] = next.substr(1)
                else if ch.changeCase
                  gChangeCase = ch.changeCase
              when gChangeCase == "U"
                fmtParts[i] = ch.toUpperCase()
              when gChangeCase == "L"
                fmtParts[i] = ch.toLowerCase()

          fmtParts.join("")

        @variables.__ = null
        formatted

      resolveVariables: (snippet, editor) ->
          result = []

          gotoNext = (ch) ->
            i1 = snippet.indexOf(ch, i + 1)
            if i1 != -1
              i = i1

          for i in [0...snippet.length]
            ch = snippet[i]
            switch
              when typeof ch == "string"
                result.push(ch)
              when typeof ch != "object"
                continue
              when ch.skip
                gotoNext(ch)
              when ch.processed < i
                continue
              when ch.text
                  value = @getVariableValue(editor, ch.text)
                  if value and ch.fmtString
                    value = @tmStrFormat(value, ch)
                  ch.processed = i
                  if ch.expectIf == null
                    if value
                      result.push value
                      gotoNext ch
                  else
                    if value
                      ch.skip = ch.elseBranch
                    else
                      gotoNext ch
              when ch.tabstopId != null
                result.push(ch)
              when ch.changeCase != null
                result.push(ch)

          result

      insertSnippet: (editor, snippetText) ->
        cursor = editor.getCursorPosition()
        line = editor.session.getLine(cursor.row)
        indentString = line.match(/^\s*/)[0]
        tabString = editor.session.getTabString()

        tokens = @tokenizeTmSnippet(snippetText)
        tokens = @resolveVariables(tokens, editor)
        tokens = tokens.map (x) ->
          if x == "\n"
            x + indentString
          if typeof x == "string"
            x.replace(/\t/g, tabString)
          else
            x

        tabstops = []
        tokens.forEach (p, i) ->
          if typeof p != "object"
            return
          id = p.tabstopId
          if not tabstops[id]
            tabstops[id] = []
            tabstops[id].index = id
            tabstops[id].value = ""

          return if tabstops[id].indexOf(p) != -1

          tabstops[id].push(p)
          i1 = tokens.indexOf(p, i + 1)

          return if i1 == -1

          value = tokens.slice(i + 1, i1).join("")
          if value
            tabstops[id].value = value

        tabstops.forEach (ts) ->
          ts.value and ts.forEach (p) ->
            i = tokens.indexOf(p)
            i1 = tokens.indexOf(p, i + 1)
            if i1 == -1
              tokens.splice(i + 1, 0, ts.value, p)
            else if i1 == i + 1
              tokens.splice(i + 1, 0, ts.value)
   
        row = 0
        column = 0
        text = ""
        tokens.forEach (t) ->
          if typeof t == "string"
            if t[0] == "\n"
              column = t.length - 1
              row += 1
            else
              column += t.length
            text += t
          else
            if not t.start
              t.start =
                row: row
                column: column
            else
              t.end = 
                row: row
                column: column

        range = editor.getSelectionRange()
        end = editor.session.replace(range, text)

        tabstopManager = new TabstopManager(editor)
        tabstopManager.addTabstops(tabstops, range.start, end)
        tabstopManager.tabNext()

      $getScope: (editor) ->
        scope = editor.session.$mode.$id or ""
        scope = scope.split("/").pop()
        if editor.session.$mode.$modes
          c = editor.getCursorPosition()
          state = editor.session.getState(c.row)
          if state.substring
            if state.substring(0, 3) == "js-"
              scope = "javascript"
            else if state.substring(0, 4) == "css-"
              scope = "css"
            else if state.substring(0, 4) == "php-"
              scope = "php"
        scope

      expandWithTab: (editor) ->
          cursor = editor.getCursorPosition()
          line = editor.session.getLine(cursor.row)
          before = line.substring(0, cursor.column)
          after = line.substr(cursor.column)

          scope = @$getScope(editor)
          snippetMap = @snippetMap
          snippet
          [scope, "_"].some (scope) =>
            snippets = snippetMap[scope]
            if (snippets)
              snippet = @findMatchingSnippet(snippets, before, after)
            not not snippet
          if not snippet
            false
          else
            editor.session.doc.removeInLine cursor.row,
                cursor.column - snippet.replaceBefore.length,
                cursor.column + snippet.replaceAfter.length

            @variables.M__ = snippet.matchBefore
            @variables.T__ = snippet.matchAfter
            @insertSnippet(editor, snippet.content)

            @variables.M__ = @variables.T__ = null
            true

      findMatchingSnippet: (snippetList, before, after) ->
        for i in [snippetList.length-1..0]
          s = snippetList[i]
          if s.startRe and not s.startRe.test(before)
            continue
          if s.endRe and not s.endRe.test(after)
            continue
          if not s.startRe and not s.endRe
            continue

          s.matchBefore =   if s.startRe      then s.startRe.exec(before)        else [""]
          s.matchAfter =    if s.endRe        then s.endRe.exec(after)           else [""]
          s.replaceBefore = if s.triggerRe    then s.triggerRe.exec(before)[0]   else  ""
          s.replaceAfter =  if s.endTriggerRe then s.endTriggerRe.exec(after)[0] else  ""
          return s

     
      register: (snippets, scope) ->
          snippetMap = @snippetMap
          snippetNameMap = @snippetNameMap
          self = @
          wrapRegexp = (src) -> 
            if src and not /^\^?\(.*\)\$?$|^\\b$/.test(src)
              src = "(?:" + src + ")"

            src or ""

          guardedRegexp = (re, guard, opening) ->
            re = wrapRegexp(re)
            guard = wrapRegexp(guard)
            if opening
              re = guard + re
              if re and re[re.length - 1] != "$"
                re = re + "$"
            else
              re = re + guard;
              if re and re[0] != "^"
                re = "^" + re
          
            new RegExp(re)

          addSnippet = (s) ->
            if not s.scope
              s.scope = scope or "_"
            scope = s.scope
            if not snippetMap[scope]
              snippetMap[scope] = []
              snippetNameMap[scope] = {}

            map = snippetNameMap[scope]
            if s.name
              old = map[s.name]
              if old
                self.unregister(old)
              map[s.name] = s

            snippetMap[scope].push s

            if s.tabTrigger and not s.trigger
              if not s.guard and /^\w/.test(s.tabTrigger)
                s.guard = "\\b"
              s.trigger = lang.escapeRegExp(s.tabTrigger)
          

            s.startRe = guardedRegexp(s.trigger, s.guard, true)
            s.triggerRe = new RegExp(s.trigger, "", true)

            s.endRe = guardedRegexp(s.endTrigger, s.endGuard, true)
            s.endTriggerRe = new RegExp(s.endTrigger, "", true)

          if snippets.content
            addSnippet(snippets)
          else if Array.isArray(snippets)
            snippets.forEach addSnippet

      unregister: (snippets, scope) ->
        snippetMap = @snippetMap
        snippetNameMap = @snippetNameMap

        removeSnippet = (s) ->
          nameMap = snippetNameMap[s.scope or scope]
          if nameMap and nameMap[s.name]
            delete nameMap[s.name]
            map = snippetMap[s.scope or scope]
            i = map?.indexOf(s)
            if i >= 0
              map.splice(i, 1)
       
        if snippets.content
          removeSnippet snippets
        else if Array.isArray snippets
          snippets.forEach removeSnippet

      parseSnippetFile: (str) ->
        str = str.replace(/\r/, "")
        list = []
        snippet = {}
        re = /^#.*|^({[\s\S]*})\s*$|^(\S+) (.*)$|^((?:\n*\t.*)+)/gm

        while m = re.exec(str)
          if m[1]
            try
              snippet = JSON.parse(m[1])
              list.push snippet
            catch e
          if m[4]
            snippet.content = m[4].replace(/^\t/gm, "")
            list.push snippet
            snippet = {}
          else
            key = m[2]
            val = m[3]
            switch(key)
              when "regex"
                guardRe = /\/((?:[^\/\\]|\\.)*)|$/g
                snippet.guard = guardRe.exec(val)[1]
                snippet.trigger = guardRe.exec(val)[1]
                snippet.endTrigger = guardRe.exec(val)[1]
                snippet.endGuard = guardRe.exec(val)[1]
              when "snippet"
                snippet.tabTrigger = val.match(/^\S*/)[0]
                if not snippet.name
                  snippet.name = val
              else
                snippet[key] = val
   
        list

      getSnippetByName: (name, editor) ->
        scope = editor and @$getScope(editor)
        snippetMap = @snippetNameMap
        [scope, "_"].some (scope) =>
          snippets = snippetMap[scope]
          if snippets
            snippet = snippets[name]
          not not snippet
        snippet

    class TabstopManager 
      constructor: (editor) ->
        if editor.tabstopManager
          editor.tabstopManager
        else
          editor.tabstopManager = @
          @$onChange = @onChange.bind(@);
          @$onChangeSelection = lang.delayedCall(@onChangeSelection.bind(@)).schedule
          @$onChangeSession = @onChangeSession.bind(@)
          @$onAfterExec = @onAfterExec.bind(@)
          @attach(editor)
        @keyboardHandler = new HashHandler()
        @keyboardHandler.bindKeys
          "Tab"      : (ed) -> ed.tabstopManager.tabNext(1)
          "Shift-Tab": (ed) -> ed.tabstopManager.tabNext(-1)
          "Esc"      : (ed) -> ed.tabstopManager.detach()
          "Return"   : (ed) -> false

      attach: (editor) ->
        @index = -1
        @ranges = []
        @tabstops = []
        @selectedTabstop = null

        @editor = editor
        @editor.on("change", @$onChange)
        @editor.on("changeSelection", @$onChangeSelection)
        @editor.on("changeSession", @$onChangeSession)
        @editor.commands.on("afterExec", @$onAfterExec)
        @editor.keyBinding.addKeyboardHandler(@keyboardHandler)

      detach: ->
        @tabstops.forEach(@removeTabstopMarkers, @)
        @ranges = null
        @tabstops = null
        @selectedTabstop = null
        @editor.removeListener("change", @$onChange)
        @editor.removeListener("changeSelection", @$onChangeSelection)
        @editor.removeListener("changeSession", @$onChangeSession)
        @editor.commands.removeListener("afterExec", @$onAfterExec)
        @editor.keyBinding.removeKeyboardHandler(@keyboardHandler)
        @editor.tabstopManager = null
        @editor = null

      onChange: (e) ->
        changeRange = e.data.range
        isRemove = e.data.action[0] == "r"
        start = changeRange.start
        end = changeRange.end
        startRow = start.row
        endRow = end.row
        lineDif = endRow - startRow
        colDiff = end.column - start.column

        if isRemove
          lineDif = -lineDif
          colDiff = -colDiff
        
        if not @$inChange and isRemove
          ts = @selectedTabstop
          changedOutside = not ts.some (r) ->
              comparePoints(r.start, start) <= 0 and comparePoints(r.end, end) >= 0

          if changedOutside
            return @detach()

        ranges = @ranges;
        for i in [0...ranges.length]
          r = ranges[i]
          if r.end.row < start.row
            continue

          if comparePoints(start, r.start) < 0 and comparePoints(end, r.end) > 0
            @removeRange(r)
            i--
            continue

          if r.start.row == startRow and r.start.column > start.column
            r.start.column += colDiff
          if r.end.row == startRow and r.end.column >= start.column
            r.end.column += colDiff
          if r.start.row >= startRow
            r.start.row += lineDif
          if r.end.row >= startRow
            r.end.row += lineDif

          if comparePoints(r.start, r.end) > 0
            @removeRange(r)

        if not ranges.length
          @detach()

      updateLinkedFields: ->
        ts = @selectedTabstop
        if ts.hasLinkedRanges
          @$inChange = true
          session = @editor.session
          text = session.getTextRange(ts.firstNonLinked)
          for i in [ts.length-1...0]
            range = ts[i]
            continue if not range.linked

            fmt = exports.snippetManager.tmStrFormat(text, range.original)
            session.replace(range, fmt)
          @$inChange = false

      onAfterExec: (e) ->
        if e.command and not e.command.readOnly
          @updateLinkedFields()

      onChangeSelection: ->
        if @editor
          lead = @editor.selection.lead
          anchor = @editor.selection.anchor
          isEmpty = @editor.selection.isEmpty()
          for i in [@ranges.length-1..0]
            continue if @ranges[i].linked

            containsLead = @ranges[i].contains(lead.row, lead.column)
            containsAnchor = isEmpty or @ranges[i].contains(anchor.row, anchor.column)
            return if containsLead and containsAnchor
          @detach()
    
      onChangeSession: -> @detach()

      tabNext: (dir) ->
        max = @tabstops.length - 1
        index = @index + (dir or 1)
        index = Math.min( Math.max(index, 0), max )
        @selectTabstop(index)
        if index == max
          @detach()

      selectTabstop: (index) ->
        ts = @tabstops[@index]
        @addTabstopMarkers(ts) if ts
        @index = index
        ts = @tabstops[@index]
        if ts?.length
          @selectedTabstop = ts
          if not @editor.inVirtualSelectionMode    
            sel = @editor.multiSelect
            sel.toSingleRange ts.firstNonLinked.clone() if ts.hasLinkedRanges
            for i in [ts.length-1..0]
              continue if ts.hasLinkedRanges and ts[i].linked
              sel.addRange(ts[i].clone(), true)
          else
            @editor.selection.setRange(ts.firstNonLinked)
          
          @editor.keyBinding.addKeyboardHandler(@keyboardHandler)

      addTabstops: (tabstops, start, end) ->
        if not tabstops[0]
          p = Range.fromPoints(end, end)
          moveRelative(p.start, start)
          moveRelative(p.end, start)
          tabstops[0] = [p]
          tabstops[0].index = 0

        i = @index
        arg = [i, 0]
        ranges = @ranges
        editor = @editor
        tabstops.forEach (ts) =>
          for i in [ts.length-1...0]
            p = ts[i]
            range = Range.fromPoints(p.start, p.end or p.start)
            movePoint(range.start, start)
            movePoint(range.end, start)
            range.original = p
            range.tabstop = ts
            ranges.push(range)
            ts[i] = range
            if p.fmtString
              range.linked = true
              ts.hasLinkedRanges = true
            else if not ts.firstNonLinked
              ts.firstNonLinked = range
          
          if not ts.firstNonLinked
            ts.hasLinkedRanges = false
          arg.push ts
          @addTabstopMarkers ts

        arg.push arg.splice(2, 1)[0]
        @tabstops.splice.apply(@tabstops, arg)

      addTabstopMarkers: (ts) ->
        session = @editor.session
        ts.forEach (range) ->
          if not range.markerId
            range.markerId = session.addMarker(range, "ace_snippet-marker", "text")

      removeTabstopMarkers: (ts) ->
        session = @editor.session
        ts.forEach (range) ->
          session.removeMarker(range.markerId)
          range.markerId = null

      removeRange: (range) ->
        i = range.tabstop.indexOf(range)
        range.tabstop.splice(i, 1)
        i = @ranges.indexOf(range)
        @ranges.splice(i, 1)
        @editor.session.removeMarker(range.markerId)

    movePoint = (point, diff) ->
      if point.row == 0
        point.column += diff.column
      point.row += diff.row

    moveRelative = (point, start) ->
      if point.row == start.row
        point.column -= start.column
      point.row -= start.row

    require("./lib/dom").importCssString("""
      .ace_snippet-marker {
          -moz-box-sizing: border-box;
          box-sizing: border-box;
          background: rgba(194, 193, 208, 0.09);
          border: 1px dotted rgba(211, 208, 235, 0.62);
          position: absolute;
      }
    """);

    exports.snippetManager = new SnippetManager()
    exports

  define 'ace/autocomplete', [
    'require'
    'exports'
    'module'
    'ace/keyboard/hash_handler'
    'ace/autocomplete/popup'
    'ace/autocomplete/util'
    'ace/lib/event'
    'ace/lib/lang'
    'ace/snippets'
  ], (require, exports, module) ->

    HashHandler = require("./keyboard/hash_handler").HashHandler
    AcePopup = require("./autocomplete/popup").AcePopup
    util = require("./autocomplete/util")
    event = require("./lib/event")
    lang = require("./lib/lang")
    snippetManager = require("./snippets").snippetManager

    class Autocomplete
      constructor: ->
        @keyboardHandler = new HashHandler()
        @keyboardHandler.bindKeys(@commands)

        @blurListener = @blurListener.bind(@)
        @changeListener = @changeListener.bind(@)
        @mousedownListener = @mousedownListener.bind(@)
        @mousewheelListener = @mousewheelListener.bind(@)
        # Possible issue: delayedCall is being called repeatedly when a key is pressed and the '<' added to the text
        # might be causing a problem.
        @changeTimer = lang.delayedCall => 
          @updateCompletions(true)
        #@changeTimer.cancel()

      $init: ->
        @popup = AcePopup(document.body or document.documentElement)
        @popup.on "click", (e) =>
          @insertMatch()
          e.stop()

      openPopup: (editor, keepPopupPosition) ->
        if not @popup
          @$init()

        # Get description of first element
        ace.config._dispatchEvent 'desc', 
          ident: @completions.filtered[0].caption

        @popup.setData @completions.filtered

        renderer = editor.renderer
        if not keepPopupPosition
          lineHeight = renderer.layerConfig.lineHeight
          pos = renderer.$cursorLayer.getPixelPosition(null, true)
          rect = editor.container.getBoundingClientRect()
          pos.top += rect.top - renderer.layerConfig.offset
          pos.left += rect.left
          pos.left += renderer.$gutterLayer.gutterWidth

          @popup.show(pos, lineHeight)
        renderer.updateText()

      detach: ->
        @editor.keyBinding.removeKeyboardHandler(@keyboardHandler)
        @editor.removeEventListener("changeSelection", @changeListener)
        @editor.removeEventListener("blur", @changeListener)
        @editor.removeEventListener("mousedown", @changeListener)
        @changeTimer.cancel()
        
        @popup?.hide()

        @activated = false

      changeListener: (e) ->
        if @activated
          @changeTimer.schedule()
        else
          @detach()

      blurListener: ->
        if document.activeElement != @editor.textInput.getElement()
          @detach()

      mousedownListener: (e) -> @detach()

      mousewheelListener: (e) -> @detach()

      goTo: (where) ->
        row = @popup.getRow()
        max = @popup.session.getLength() - 1

        switch(where)
          when "up"    then row = (if row <= 0   then max else row - 1)
          when "down"  then row = (if row >= max then 0   else row + 1)
          when "start" then row = 0
          when "end"   then row = max

        @popup.setRow(row)

      insertMatch: (data) ->
        @detach()
        data ?= @popup.getData(@popup.getRow())
        if not data
          return false
        if data.completer?.insertMatch
            data.completer.insertMatch(@editor)
        else
          if @completions.filterText
            range = @editor.selection.getRange()
            range.start.column -= @completions.filterText.length
            @editor.session.remove(range)
          
          if data.snippet
            snippetManager.insertSnippet(@editor, data.snippet)
          else
            @editor.insert(data.value or data)

      commands:
        "Up"                : (editor) -> editor.completer.goTo("up")
        "Down"              : (editor) -> editor.completer.goTo("down")
        "Ctrl-Up|Ctrl-Home" : (editor) -> editor.completer.goTo("start")
        "Ctrl-Down|Ctrl-End": (editor) -> editor.completer.goTo("end")

        "Esc"               : (editor) -> editor.completer.detach()
        "Space"             : (editor) ->
                                editor.completer.detach()
                                editor.insert(" ")
        "Return"            : (editor) -> editor.completer.insertMatch()
        "Shift-Return"      : (editor) -> editor.completer.insertMatch(true)
        "Tab"               : (editor) -> editor.completer.insertMatch()

        "PageUp"            : (editor) -> editor.completer.popup.gotoPageDown()
        "PageDown"          : (editor) -> editor.completer.popup.gotoPageUp()

      gatherCompletions: (editor, callback) ->
        session = editor.getSession()
        pos = editor.getCursorPosition()

        line = session.getLine(pos.row)
        prefix = util.retrievePrecedingIdentifier(line, pos.column)

        matches = []
        util.parForEach editor.completers, (completer, next) ->
          completer.getCompletions editor, session, pos, prefix, (err, results) ->
            if not err
              matches = matches.concat(results)
            next()
        , ->
          matches.sort (a, b) -> b.score - a.score

          callback null,
            prefix: prefix
            matches: matches

        true

      showPopup: (editor) ->
        if @editor
          @detach()
        
        @activated = true

        @editor = editor
        if editor.completer != @
          if editor.completer
            editor.completer.detach()
          editor.completer = @

        editor.keyBinding.addKeyboardHandler(@keyboardHandler)
        #editor.on("changeSelection", @changeListener)
        editor.on("blur", @blurListener)
        editor.on("mousedown", @mousedownListener)
        @updateCompletions()
        @changeTimer.cancel()
      
      updateCompletions: (keepPopupPosition) ->
          @gatherCompletions @editor, (err, results) =>
            matches = results?.matches
            
            if matches?.length
              @completions = new FilteredList(matches)
              @completions.setFilter(results.prefix)
              @openPopup(@editor, keepPopupPosition)
              #@popup.setHighlight(results.prefix)
            else
              @detach()

      cancelContextMenu: ->
        stop = (e) =>
          @editor.off("nativecontextmenu", stop)
          if e?.domEvent
            event.stopEvent(e.domEvent)
        setTimeout(stop, 10)
        @editor.on("nativecontextmenu", stop)

    Autocomplete.startCommand =
      name: "startAutocomplete"
      exec: (editor) ->
        if not editor.completer
          editor.completer = new Autocomplete()
        editor.completer.showPopup(editor)
        editor.completer.cancelContextMenu()

        editor.getSession().insert(editor.getCursorPosition(), '<')
      bindKey: "<"

    class FilteredList
      constructor: (array, mutateData) ->
        @all = array;
        @filtered = array.concat()
        @filterText = ""

      setFilter: (str) ->
        @filterText = str

    exports.Autocomplete = Autocomplete
    exports.FilteredList = FilteredList
    exports

  define 'ace/autocomplete/popup', [
    'require'
    'exports'
    'module'
    'ace/edit_session'
    'ace/virtual_renderer'
    'ace/editor'
    'ace/range'
    'ace/lib/event'
    'ace/lib/lang'
    'ace/lib/dom'
  ], (require, exports, module) ->

    EditSession = require("ace/edit_session").EditSession
    Renderer = require("ace/virtual_renderer").VirtualRenderer
    Editor = require("ace/editor").Editor
    Range = require("ace/range").Range
    event = require("ace/lib/event")
    lang = require("ace/lib/lang")
    dom = require("ace/lib/dom")

    $singleLineEditor = (el) ->
      renderer = new Renderer(el)

      renderer.$maxLines = 4
      
      editor = new Editor(renderer)

      editor.setHighlightActiveLine(false)
      editor.setShowPrintMargin(false)
      editor.renderer.setShowGutter(false)
      editor.renderer.setHighlightGutterLine(false)

      editor.$mouseHandler.$focusWaitTimout = 0

      editor

    AcePopup = (parentNode) ->
      el = dom.createElement("div")
      popup = new $singleLineEditor(el)
      
      if parentNode
        parentNode.appendChild(el)
      el.style.display = "none"
      popup.renderer.content.style.cursor = "default"
      popup.renderer.setStyle("ace_autocomplete")

      noop = ->

      popup.focus = noop
      popup.$isFocused = true

      popup.renderer.$cursorLayer.restartTimer = noop
      popup.renderer.$cursorLayer.element.style.opacity = 0

      popup.renderer.$maxLines = 8
      popup.renderer.$keepTextAreaAtCursor = false

      popup.setHighlightActiveLine(true)
      popup.session.highlight("")
      popup.session.$searchHighlight.clazz = "ace_highlight-marker"

      popup.on "mousedown", (e) ->
        pos = e.getDocumentPosition()
        popup.moveCursorToPosition(pos)
        popup.selection.clearSelection()
        e.stop()

      hoverMarker = new Range(-1,0,-1,Infinity)
      hoverMarker.id = popup.session.addMarker(hoverMarker, "ace_line-hover", "fullLine")
      popup.on "mousemove", (e) ->
        row = e.getDocumentPosition().row
        hoverMarker.start.row = hoverMarker.end.row = row
        popup.session._emit("changeBackMarker")

      hideHoverMarker = ->
        hoverMarker.start.row = hoverMarker.end.row = -1
        popup.session._emit("changeBackMarker")

      event.addListener(popup.container, "mouseout", hideHoverMarker)
      popup.on("hide", hideHoverMarker)
      popup.on("changeSelection", hideHoverMarker)
      popup.on "mousewheel", (e) ->
        setTimeout ->
          popup._signal("mousemove", e)

      popup.session.doc.getLength = -> popup.data.length

      popup.session.doc.getLine = (i) ->
        data = popup.data[i]
        if typeof data == "string"
          data
        else
          (data and data.value) or ""

      bgTokenizer = popup.session.bgTokenizer
      bgTokenizer.$tokenizeRow = (i) ->
          data = popup.data[i]
          tokens = []
          if not data
            return tokens
          if typeof data == "string"
            data = 
              value: data
          if not data.caption
            data.caption = data.value

          tokens.push
            type: data.className or ""
            value: data.caption

          if data.meta
            maxW = popup.renderer.$size.scrollerWidth / popup.renderer.layerConfig.characterWidth
            if data.meta.length + data.caption.length < maxW - 2
              tokens.push
                type: "rightAlignedText"
                value: data.meta
          tokens

      bgTokenizer.$updateOnChange = noop
      
      popup.session.$computeWidth = -> @screenWidth = 0

      popup.data = []
      popup.setData = (list) ->
        popup.data = list or []
        popup.setValue(lang.stringRepeat("\n", list.length), -1)

      popup.getData = (row) -> popup.data[row]

      popup.getRow = ->
        line = @getCursorPosition().row
        if line == 0 and not @getHighlightActiveLine()
          line = -1
        line

      popup.setRow = (line) ->
        popup.setHighlightActiveLine(line != -1)
        popup.selection.clearSelection()
        popup.moveCursorTo(line, 0 or 0)
        ace.config._dispatchEvent 'desc',
          ident: popup.getData(line).caption


      popup.setHighlight = (re) ->
        popup.session.highlight(re)
        popup.session._emit("changeFrontMarker")

      popup.hide = ->
        @container.style.display = "none"
        @_signal("hide")
        ace.config._signal("desc:clear")

      popup.show = (pos, lineHeight) ->
        el = @container
        if pos.top > window.innerHeight / 2  + lineHeight
          el.style.top = ""
          el.style.bottom = window.innerHeight - pos.top + "px"
        else
          pos.top += lineHeight
          el.style.top = pos.top + "px"
          el.style.bottom = ""

        el.style.left = pos.left + "px"
        el.style.display = ""
        @renderer.$textLayer.checkForSizeChanges()

        @_signal("show")

      popup

    dom.importCssString("""
      .ace_autocomplete.ace-tm .ace_marker-layer .ace_active-line {
          background-color: #abbffe;
      }
      .ace_autocomplete.ace-tm .ace_line-hover {
          border: 1px solid #abbffe;
          position: absolute;
          background: rgba(233,233,253,0.4);
          z-index: 2;
          margin-top: -1px;
      }
      .ace_rightAlignedText {
          color: gray;
          display: inline-block;
          position: absolute;\
          right: 4px;
          text-align: right;
          z-index: -1;
      }
      .ace_autocomplete {
          width: 200px;
          height: 120px;
          z-index: 200000;
          background: #f8f8f8;
          border: 1px lightgray solid;
          position: fixed;
          box-shadow: 2px 3px 5px rgba(0,0,0,.2);
      }
    """)

    exports.AcePopup = AcePopup
    exports

  define 'ace/autocomplete/util', [
    'require'
    'exports'
    'module'
  ], (require, exports, module) ->

    exports.parForEach = (array, fn, callback) ->
      completed = 0
      arLength = array.length
      if arLength == 0
        callback()
      for completer in array
        fn completer, (result, err) ->
          completed++
          if completed == arLength
            callback(result, err)

    ID_REGEX = /[a-zA-Z_0-9\$-]/

    exports.retrievePrecedingIdentifier = (text, pos, regex) ->
      regex = regex or ID_REGEX
      buf = []
      for i in [pos-1..0]
        if regex.test(text[i])
          buf.push text[i]
        else
          break
      
      buf.reverse().join("")

    exports.retrieveFollowingIdentifier = (text, pos, regex) ->
        regex = regex or ID_REGEX
        buf = []
        for i in [pos...text.length]
          if regex.test(text[i])
              buf.push text[i]
          else
              break;
        buf
    exports

  define 'ace/autocomplete/text_completer', [
    'require'
    'exports'
    'module'
    'ace/range'
  ], (require, exports, module) ->
    Range = require("ace/range").Range
    
    splitRegex = /[^a-zA-Z_0-9\$\-]+/

    getWordIndex = (doc, pos) ->
      textBefore = doc.getTextRange(Range.fromPoints({row: 0, column:0}, pos))
      textBefore.split(splitRegex).length - 1

    filterPrefix = (prefix, words) ->
      results = []
      for i in [0...words.length]
        if words[i].lastIndexOf(prefix, 0) == 0
          results.push words[i]
      results

    wordDistance = (doc, pos) ->
      prefixPos = getWordIndex(doc, pos)
      words = doc.getValue().split(splitRegex)
      wordScores = Object.create(null)
      
      currentWord = words[prefixPos]

      words.forEach (word, idx) ->
        if word and word isnt currentWord
          distance = Math.abs(prefixPos - idx)
          score = words.length - distance

          wordScores[word] = if wordScores[word] then Math.max(score, wordScores[word]) else score
          
      wordScores

    exports.getCompletions = (editor, session, pos, prefix, callback) ->
      wordScore = wordDistance(session, pos, prefix)
      wordList = filterPrefix(prefix, Object.keys(wordScore))
      callback null, wordList.map (word) ->
        {
          name: word
          value: word
          score: wordScore[word]
          meta: "local"
        }
    exports
