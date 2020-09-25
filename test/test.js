describe('html-toolbar-element', function () {
  describe('element creation', function () {
    it('creates from document.createElement', function () {
      const el = document.createElement('html-toolbar')
      assert.equal('HTML-TOOLBAR', el.nodeName)
    })

    it('creates from constructor', function () {
      const el = new window.HTMLToolbarElement()
      assert.equal('HTML-TOOLBAR', el.nodeName)
    })
  })

  describe('in shadow DOM', function () {
    it('finds field and inserts html', function () {
      const div = document.createElement('div')
      const shadow = div.attachShadow({mode: 'open'})
      shadow.innerHTML = `<html-toolbar for="id"><html-bold>bold</html-bold></html-toolbar><textarea id="id"></textarea>`
      document.body.append(div)

      const toolbar = shadow.querySelector('html-toolbar')
      assert(toolbar.field, 'textarea is found')

      toolbar.querySelector('html-bold').click()
      assert(toolbar.field.value, '**')
    })
  })

  describe('after tree insertion', function () {
    function focus() {
      const textarea = document.querySelector('textarea')
      const event = document.createEvent('Event')
      event.initEvent('focus', false, true)
      textarea.dispatchEvent(event)
    }

    function pressHotkey(hotkey) {
      const textarea = document.querySelector('textarea')
      const osx = navigator.userAgent.indexOf('Macintosh') !== -1
      const event = document.createEvent('Event')
      event.initEvent('keydown', true, true)
      event.metaKey = osx
      event.ctrlKey = !osx
      event.key = hotkey
      textarea.dispatchEvent(event)
    }

    function clickToolbar(selector) {
      const toolbar = document.querySelector('html-toolbar')
      toolbar.querySelector(selector).click()
    }

    function visualValue() {
      const textarea = document.querySelector('textarea')
      const before = textarea.value.slice(0, textarea.selectionStart)
      const selection = textarea.value.slice(textarea.selectionStart, textarea.selectionEnd)
      const after = textarea.value.slice(textarea.selectionEnd)
      if (selection) {
        return `${before}|${selection}|${after}`
      } else {
        return `${before}|${after}`
      }
    }

    function setVisualValue(value) {
      const textarea = document.querySelector('textarea')
      let idx
      const parts = value.split('|', 3)
      textarea.value = parts.join('')
      switch (parts.length) {
        case 2:
          idx = parts[0].length
          textarea.setSelectionRange(idx, idx)
          break
        case 3:
          idx = parts[0].length
          textarea.setSelectionRange(idx, idx + parts[1].length)
          break
      }
    }

    beforeEach(function () {
      const container = document.createElement('div')
      container.innerHTML = `
        <html-toolbar for="textarea_id">
          <html-bold>bold</html-bold>
          <html-header>header</html-header>
          <html-header level="1">h1</html-header>
          <div hidden>
            <html-header level="5">h5</html-header>
          </div>
          <html-header level="10">h1</html-header>
          <div data-html-button>Other button</div>
          <html-italic>italic</html-italic>
          <html-underline>underline</html-underline>
          <html-strikethrough>strikethrough</html-strikethrough>
          <html-quote>quote</html-quote>
          <html-code>code</html-code>
          <html-link>link</html-link>
          <html-image>image</html-image>
          <html-unordered-list>unordered-list</html-unordered-list>
          <html-ordered-list>ordered-list</html-ordered-list>
          <html-task-list>task-list</html-task-list>
          <html-mention>mention</html-mention>
          <html-ref>ref</html-ref>
        </html-toolbar>
        <textarea id="textarea_id"></textarea>
      `
      document.body.append(container)
    })

    afterEach(function () {
      document.body.innerHTML = ''
    })

    describe('focus management', function () {
      function focusFirstButton() {
        const button = document.querySelector('html-bold')
        button.focus()
      }

      function pushKeyOnFocussedButton(key) {
        const event = document.createEvent('Event')
        event.initEvent('keydown', true, true)
        event.key = key
        document.activeElement.dispatchEvent(event)
      }

      function getElementsWithTabindex(index) {
        return [...document.querySelectorAll(`html-toolbar [tabindex="${index}"]`)]
      }

      beforeEach(() => {
        document.querySelector('html-toolbar').focus()
      })

      it('moves focus to next button when ArrowRight is pressed', function () {
        focusFirstButton()
        pushKeyOnFocussedButton('ArrowRight')
        assert.equal(getElementsWithTabindex(-1).length, 14)
        assert.deepEqual(getElementsWithTabindex(0), [document.querySelector('html-header')])
        assert.deepEqual(getElementsWithTabindex(0), [document.activeElement])
        pushKeyOnFocussedButton('ArrowRight')
        assert.equal(getElementsWithTabindex(-1).length, 14)
        assert.deepEqual(getElementsWithTabindex(0), [document.querySelector('html-header[level="1"]')])
        assert.deepEqual(getElementsWithTabindex(0), [document.activeElement])
        pushKeyOnFocussedButton('ArrowRight')
        assert.equal(getElementsWithTabindex(-1).length, 14)
        assert.deepEqual(getElementsWithTabindex(0), [document.querySelector('html-header[level="10"]')])
        assert.deepEqual(getElementsWithTabindex(0), [document.activeElement])
      })

      it('cycles focus round to last element from first when ArrowLeft is pressed', function () {
        focusFirstButton()
        pushKeyOnFocussedButton('ArrowLeft')
        assert.equal(getElementsWithTabindex(-1).length, 14)
        assert.deepEqual(getElementsWithTabindex(0), [document.querySelector('html-ref')])
        assert.deepEqual(getElementsWithTabindex(0), [document.activeElement])
        pushKeyOnFocussedButton('ArrowLeft')
        assert.equal(getElementsWithTabindex(-1).length, 14)
        assert.deepEqual(getElementsWithTabindex(0), [document.querySelector('html-mention')])
        assert.deepEqual(getElementsWithTabindex(0), [document.activeElement])
      })

      it('focussed first/last button when Home/End key is pressed', function () {
        focusFirstButton()
        pushKeyOnFocussedButton('End')
        assert.equal(getElementsWithTabindex(-1).length, 14)
        assert.deepEqual(getElementsWithTabindex(0), [document.querySelector('html-ref')])
        assert.deepEqual(getElementsWithTabindex(0), [document.activeElement])
        pushKeyOnFocussedButton('End')
        assert.equal(getElementsWithTabindex(-1).length, 14)
        assert.deepEqual(getElementsWithTabindex(0), [document.querySelector('html-ref')])
        assert.deepEqual(getElementsWithTabindex(0), [document.activeElement])
        pushKeyOnFocussedButton('Home')
        assert.equal(getElementsWithTabindex(-1).length, 14)
        assert.deepEqual(getElementsWithTabindex(0), [document.querySelector('html-bold')])
        assert.deepEqual(getElementsWithTabindex(0), [document.activeElement])
        pushKeyOnFocussedButton('Home')
        assert.equal(getElementsWithTabindex(-1).length, 14)
        assert.deepEqual(getElementsWithTabindex(0), [document.querySelector('html-bold')])
        assert.deepEqual(getElementsWithTabindex(0), [document.activeElement])
      })

      it('counts `data-html-button` elements in the focussable set', function () {
        focusFirstButton()
        pushKeyOnFocussedButton('ArrowRight')
        pushKeyOnFocussedButton('ArrowRight')
        pushKeyOnFocussedButton('ArrowRight')
        pushKeyOnFocussedButton('ArrowRight')
        assert.equal(getElementsWithTabindex(-1).length, 14)
        assert.deepEqual(getElementsWithTabindex(0), [document.querySelector('div[data-html-button]')])
        assert.deepEqual(getElementsWithTabindex(0), [document.activeElement])
      })
    })

    describe('bold', function () {
      it('bold selected text when you click the bold icon', function () {
        setVisualValue('The |quick| brown fox jumps over the lazy dog')
        clickToolbar('html-bold')
        assert.equal('The <b>|quick|</b> brown fox jumps over the lazy dog', visualValue())
      })

      it('bolds selected text with hotkey', function () {
        focus()
        setVisualValue('The |quick| brown fox jumps over the lazy dog')
        pressHotkey('b')
        assert.equal('The <b>|quick|</b> brown fox jumps over the lazy dog', visualValue())
      })

      it('bold empty selection and textarea inserts * with cursor ready to type inside', function () {
        setVisualValue('|')
        clickToolbar('html-bold')
        assert.equal('<b>|</b>', visualValue())
      })

      it('bold empty selection with previous text inserts * with cursor ready to type inside', function () {
        setVisualValue('The |')
        clickToolbar('html-bold')
        assert.equal('The <b>|</b>', visualValue())
      })

      it('bold when there is leading whitespace in selection', function () {
        setVisualValue('|\n \t Hello world|')
        clickToolbar('html-bold')
        assert.equal('\n \t <b>|Hello world|</b>', visualValue())
      })

      it('bold when there is trailing whitespace in selection', function () {
        setVisualValue('|Hello world \n|')
        clickToolbar('html-bold')
        assert.equal('<b>|Hello world|</b> \n', visualValue())
      })

      it('bold selected word when cursor is at the start of the word', function () {
        setVisualValue('The |quick brown fox jumps over the lazy dog')
        clickToolbar('html-bold')
        assert.equal('The <b>|quick</b> brown fox jumps over the lazy dog', visualValue())
      })

      it('bold selected word when cursor is in the middle of the word', function () {
        setVisualValue('The qui|ck brown fox jumps over the lazy dog')
        clickToolbar('html-bold')
        assert.equal('The <b>qui|ck</b> brown fox jumps over the lazy dog', visualValue())
      })

      it('bold selected word when cursor is at the end of the word', function () {
        setVisualValue('The quick| brown fox jumps over the lazy dog')
        clickToolbar('html-bold')
        assert.equal('The <b>quick|</b> brown fox jumps over the lazy dog', visualValue())
      })

      it('bold selected word when cursor is at the start of the first word', function () {
        setVisualValue('|The quick brown fox jumps over the lazy dog')
        clickToolbar('html-bold')
        assert.equal('<b>|The</b> quick brown fox jumps over the lazy dog', visualValue())
      })

      it('bold selected word when cursor is in the middle of the first word', function () {
        setVisualValue('T|he quick brown fox jumps over the lazy dog')
        clickToolbar('html-bold')
        assert.equal('<b>T|he</b> quick brown fox jumps over the lazy dog', visualValue())
      })

      it('bold selected word when cursor is at the end of the first word', function () {
        setVisualValue('The| quick brown fox jumps over the lazy dog')
        clickToolbar('html-bold')
        assert.equal('<b>The|</b> quick brown fox jumps over the lazy dog', visualValue())
      })

      it('unbolds selected bold inner text when you click the bold icon', function () {
        setVisualValue('The <b>|quick|</b> brown fox jumps over the lazy dog')
        clickToolbar('html-bold')
        assert.equal('The |quick| brown fox jumps over the lazy dog', visualValue())
      })

      it('unbolds selected bold outer text when you click the bold icon', function () {
        setVisualValue('The |<b>quick</b>| brown fox jumps over the lazy dog')
        clickToolbar('html-bold')
        assert.equal('The |quick| brown fox jumps over the lazy dog', visualValue())
      })

      it('unbold selected word when cursor is at the start of the word', function () {
        setVisualValue('The <b>|quick</b> brown fox jumps over the lazy dog')
        clickToolbar('html-bold')
        assert.equal('The |quick brown fox jumps over the lazy dog', visualValue())
      })

      it('unbold selected word when cursor is in the middle of the word', function () {
        setVisualValue('The <b>qui|ck</b> brown fox jumps over the lazy dog')
        clickToolbar('html-bold')
        assert.equal('The qui|ck brown fox jumps over the lazy dog', visualValue())
      })

      it('unbold selected word when cursor is at the end of the word', function () {
        setVisualValue('The <b>quick|</b> brown fox jumps over the lazy dog')
        clickToolbar('html-bold')
        assert.equal('The quick| brown fox jumps over the lazy dog', visualValue())
      })

      it('unbold selected word when cursor is before the bold syntax', function () {
        setVisualValue('The |<b>quick</b> brown fox jumps over the lazy dog')
        clickToolbar('html-bold')
        assert.equal('The |quick brown fox jumps over the lazy dog', visualValue())
      })

      it('unbold selected word when cursor is after the bold syntax', function () {
        setVisualValue('The <b>quick</b>| brown fox jumps over the lazy dog')
        clickToolbar('html-bold')
        assert.equal('The quick| brown fox jumps over the lazy dog', visualValue())
      })

      it('unbold selected word when cursor is at the start of the first word', function () {
        setVisualValue('<b>|The</b> quick brown fox jumps over the lazy dog')
        clickToolbar('html-bold')
        assert.equal('|The quick brown fox jumps over the lazy dog', visualValue())
      })

      it('unbold selected word when cursor is in the middle of the first word', function () {
        setVisualValue('<b>T|he</b> quick brown fox jumps over the lazy dog')
        clickToolbar('html-bold')
        assert.equal('T|he quick brown fox jumps over the lazy dog', visualValue())
      })

      it('unbold selected word when cursor is at the end of the first word', function () {
        setVisualValue('<b>The|</b> quick brown fox jumps over the lazy dog')
        clickToolbar('html-bold')
        assert.equal('The| quick brown fox jumps over the lazy dog', visualValue())
      })
    })

    describe('italic', function () {
      it('italicizes selected text when you click the italics icon', function () {
        setVisualValue('The |quick| brown fox jumps over the lazy dog')
        clickToolbar('html-italic')
        assert.equal('The <i>|quick|</i> brown fox jumps over the lazy dog', visualValue())
      })

      it('italicizes selected text with hotkey', function () {
        focus()
        setVisualValue('The |quick| brown fox jumps over the lazy dog')
        pressHotkey('i')
        assert.equal('The <i>|quick|</i> brown fox jumps over the lazy dog', visualValue())
      })

      it('italicize when there is leading whitespace in selection', function () {
        setVisualValue('|  \nHello world|')
        clickToolbar('html-italic')
        assert.equal('  \n<i>|Hello world|</i>', visualValue())
      })

      it('italicize when there is trailing whitespace in selection', function () {
        setVisualValue('|Hello world\n \t|')
        clickToolbar('html-italic')
        assert.equal('<i>|Hello world|</i>\n \t', visualValue())
      })

      it('italicize empty selection and textarea inserts * with cursor ready to type inside', function () {
        setVisualValue('|')
        clickToolbar('html-italic')
        assert.equal('<i>|</i>', visualValue())
      })

      it('italicize empty selection with previous text inserts * with cursor ready to type inside', function () {
        setVisualValue('The |')
        clickToolbar('html-italic')
        assert.equal('The <i>|</i>', visualValue())
      })

      it('italicize selected word when cursor is at the start of the word', function () {
        setVisualValue('The |quick brown fox jumps over the lazy dog')
        clickToolbar('html-italic')
        assert.equal('The <i>|quick</i> brown fox jumps over the lazy dog', visualValue())
      })

      it('italicize selected word when cursor is in the middle of the word', function () {
        setVisualValue('The qui|ck brown fox jumps over the lazy dog')
        clickToolbar('html-italic')
        assert.equal('The <i>qui|ck</i> brown fox jumps over the lazy dog', visualValue())
      })

      it('italicize selected word when cursor is at the end of the word', function () {
        setVisualValue('The quick| brown fox jumps over the lazy dog')
        clickToolbar('html-italic')
        assert.equal('The <i>quick|</i> brown fox jumps over the lazy dog', visualValue())
      })

      it('unitalicizes selected italic text when you click the italic icon', function () {
        setVisualValue('The <i>|quick|</i> brown fox jumps over the lazy dog')
        clickToolbar('html-italic')
        assert.equal('The |quick| brown fox jumps over the lazy dog', visualValue())
      })
    })

    describe('code', function () {
      it('surrounds a line with backticks if you click the code icon', function () {
        setVisualValue("|puts 'Hello, world!'|")
        clickToolbar('html-code')
        assert.equal("`|puts 'Hello, world!'|`", visualValue())
      })

      it('surrounds multiple lines with triple backticks if you click the code icon', function () {
        setVisualValue('|class Greeter\n  def hello_world\n    "Hello World!"\n  end\nend|')
        clickToolbar('html-code')
        assert.equal('```\n|class Greeter\n  def hello_world\n    "Hello World!"\n  end\nend|\n```', visualValue())
      })

      it('removes backticks from a line if you click the code icon again', function () {
        setVisualValue("`|puts 'Hello, world!'|`")
        clickToolbar('html-code')
        assert.equal("|puts 'Hello, world!'|", visualValue())
      })

      it('removes triple backticks on multiple lines if you click the code icon', function () {
        setVisualValue('```\n|class Greeter\n  def hello_world\n    "Hello World!"\n  end\nend|\n```')
        clickToolbar('html-code')
        assert.equal('|class Greeter\n  def hello_world\n    "Hello World!"\n  end\nend|', visualValue())
      })
    })

    describe('links', function () {
      it('inserts link syntax with cursor in description', function () {
        setVisualValue('|')
        clickToolbar('html-link')
        assert.equal('[|](url)', visualValue())
      })

      it('selected url is wrapped in link syntax with cursor in description', function () {
        setVisualValue("GitHub's homepage is |https://github.com/|")
        clickToolbar('html-link')
        assert.equal("GitHub's homepage is [|](https://github.com/)", visualValue())
      })

      it('cursor on url is wrapped in link syntax with cursor in description', function () {
        setVisualValue("GitHub's homepage is https://git|hub.com/")
        clickToolbar('html-link')
        assert.equal("GitHub's homepage is [|](https://github.com/)", visualValue())
      })

      it('selected plan text is wrapped in link syntax with cursor in url', function () {
        setVisualValue("GitHub's |homepage|")
        clickToolbar('html-link')
        assert.equal("GitHub's [homepage](|url|)", visualValue())
      })
    })
  })
})
