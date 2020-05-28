/* eslint-disable class-methods-use-this */
/* eslint-disable array-callback-return */
/* eslint-disable no-plusplus */
/* eslint-disable max-len */
/* eslint-disable no-use-before-define */
/* eslint-disable max-classes-per-file */
/* eslint-disable no-undef */

// defining DOM structure

const renderbasicDOM = () => {
  const body = document.querySelector('body');
  const header = document.createElement('h1');
  header.textContent = 'Virtual Keyboard app';
  body.appendChild(header);

  const outputArea = document.createElement('textarea');
  outputArea.setAttribute('rows', 5);
  outputArea.setAttribute('columns', 50);
  outputArea.setAttribute('autofucus', true);
  body.appendChild(outputArea);

  const keyboard = document.createElement('section');
  body.appendChild(keyboard);


  const operSystem = document.createElement('p');
  operSystem.textContent = 'Keyboard developped for Windows system';
  body.appendChild(operSystem);

  const langChange = document.createElement('p');
  langChange.textContent = 'To switch to Polish language, please press CTR + leftALT. Then keep rightALT to type polish letters.';
  body.appendChild(langChange);
};

renderbasicDOM();

// defining variable responsible for rendering English or Polsih keyboard and getting it from localStorage

const storageData = JSON.parse(localStorage.getItem('isPolish'));
let isPolish = storageData || false;

// defining textarea variable that will be used multiple times over the file
const textarea = document.querySelector('textarea');

// defining base class for the keys

class Key {
  constructor(key) {
    this.key = key;
    this.HTMLElem = document.createElement('span');
  }

  render() {
    this.HTMLElem.textContent = this.alias ? this.alias : this.key;
    document.querySelector('section').appendChild(this.HTMLElem);
    this.HTMLElem.addEventListener('mousedown', this.onClickAction.bind(this));
    this.HTMLElem.addEventListener('mouseup', this.onClickOffAction.bind(this));
  }

  animate() {
    this.HTMLElem.classList.add('active');
  }

  animateOff() {
    this.HTMLElem.classList.remove('active');
  }

  onClickOffAction() {
    this.animateOff();
  }
}

// defining subclass for functional keys (with different css class and configurable width)

class SpecialKey extends Key {
  constructor(width = 40, key) {
    super(key);
    this.width = width;
    this.class = 'special';
  }

  render() {
    super.render();
    this.HTMLElem.classList.add('special');
    this.HTMLElem.style.width = `${this.width}px`;
  }
}

// defining subclass for alphabetical keys

class AlphaKey extends Key {
  constructor(key, otherLangAltKey = '') {
    super(key);
    this.otherLangAltKey = otherLangAltKey;
  }

  render() {
    super.render();
    this.renderOtherLang();
  }

  renderOtherLang() {
    const languageKey = isPolish ? this.otherLangAltKey : '';
    this.HTMLElem.setAttribute('data-content', languageKey);
  }

  renderOtherMain() {
    const temp = this.key;
    this.key = this.otherLangAltKey === '' ? this.key : this.otherLangAltKey;
    this.HTMLElem.textContent = this.key;
    this.otherLangAltKey = temp;
  }

  shift() {
    this.key = this.key.toUpperCase();
    this.HTMLElem.textContent = this.key;
  }

  unshift() {
    this.key = this.key.toLowerCase();
    this.HTMLElem.textContent = this.key;
  }

  onClickAction() {
    this.animate();
    textarea.value += this.key;
  }
}

// defining subclass for numerical and symbolical keys

class NumKey extends Key {
  constructor(key, shiftkey) {
    super(key);
    this.key = key;
    this.shiftkey = shiftkey;
  }

  shift() {
    const tempkey = this.key;
    this.key = this.shiftkey;
    this.shiftkey = tempkey;
    this.HTMLElem.textContent = this.key;
  }

  unshift() {
    const tempkey = this.key;
    this.key = this.shiftkey;
    this.shiftkey = tempkey;
    this.HTMLElem.textContent = this.key;
  }

  onClickAction() {
    this.animate();
    textarea.value += this.key;
  }
}

// defining subclasses for functional keys

class ShiftKey extends SpecialKey {
  constructor(key, width) {
    super(key, width);
    this.key = 'Shift';
  }

  onClickAction() {
    this.animate();
    debugger;
    keys.map((key) => {
      if (typeof key.shift === 'function') key.shift();
    });
  }

  onClickOffAction() {
    this.animateOff();
    keys.map((key) => {
      if (typeof key.unshift === 'function') key.unshift();
    });
  }
}

class CapsLockKey extends SpecialKey {
  constructor(key, width) {
    super(key, width);
    this.key = 'CapsLock';
    this.isEnabled = false;
  }

  onClickAction() {
    if (!this.isEnabled) {
      this.animate();
      keys.filter((key) => key instanceof AlphaKey).map((key) => key.shift());
      this.isEnabled = !this.isEnabled;
    } else {
      this.animateOff();
      keys.filter((key) => key instanceof AlphaKey).map((key) => key.unshift());
      this.isEnabled = !this.isEnabled;
    }
  }

  onClickOffAction() {
    // eslint-disable-next-line no-useless-return
    return;
  }
}

class Backspace extends SpecialKey {
  constructor(key, width) {
    super(key, width);
    this.key = 'Backspace';
  }

  removeText(key) {
    const textObject = backspaceLogic(textarea, key);
    textarea.value = textObject.text;
    textarea.selectionEnd = textObject.position === undefined ? textarea.selectionEnd : textObject.position - 1;
  }

  onClickAction() {
    this.animate();
    this.removeText(this.key);
  }
}

class Delete extends Backspace {
  constructor(key) {
    super(key);
    this.key = 'Delete';
    this.alias = 'Del';
  }
}

class ArrowLeft extends SpecialKey {
  constructor(key, width) {
    super(key, width);
    this.key = 'ArrowLeft';
    this.alias = '◄';
  }

  onClickAction() {
    this.animate();
    textarea.selectionStart -= 1;
    textarea.selectionEnd = textarea.selectionStart;
    textarea.focus();
  }
}

class ArrowRight extends ArrowLeft {
  constructor(key, width) {
    super(key, width);
    this.key = 'ArrowRight';
    this.alias = '►';
  }

  onClickAction() {
    this.animate();
    textarea.selectionStart += 1;
    textarea.selectionEnd = textarea.selectionStart;
    textarea.focus();
  }
}

class ArrowUp extends ArrowRight {
  constructor(key, width) {
    super(key, width);
    this.key = 'ArrowUp';
    this.alias = '▲';
  }
}

class ArrowDown extends ArrowLeft {
  constructor(key, width) {
    super(key, width);
    this.key = 'ArrowDown';
    this.alias = '▼';
  }
}

class EnterKey extends SpecialKey {
  constructor(key, width) {
    super(key, width);
    this.key = 'Enter';
  }

  modifyText(key) {
    const textObject = EnterLogic(textarea, key);
    textarea.value = textObject.text;
    textarea.selectionEnd = textObject.position === undefined ? textarea.selectionEnd : textObject.position + 1;
    textarea.focus();
  }

  onClickAction() {
    this.animate();
    this.modifyText('\n');
  }
}

class TabKey extends EnterKey {
  constructor(key, width) {
    super(key, width);
    this.key = 'Tab';
  }

  onClickAction() {
    this.animate();
    this.modifyText('\t');
  }
}

class Space extends EnterKey {
  constructor(key, width) {
    super(key, width);
    this.key = ' ';
  }

  onClickAction() {
    this.animate();
    this.modifyText(' ');
  }
}

class AltGraph extends SpecialKey {
  constructor(key, width) {
    super(key, width);
    this.key = 'AltGraph';
    this.alias = 'Alt';
  }

  switchMain() {
    if (isPolish) {
      keys.filter((key) => key instanceof AlphaKey).map((key) => key.renderOtherMain());
    }
  }

  onClickAction() {
    this.animate();
    this.switchMain();
  }

  onClickOffAction() {
    this.animateOff();
    this.switchMain();
  }
}

class Alt extends SpecialKey {
  constructor(key, width) {
    super(key, width);
    this.key = 'Alt';
  }

  onClickAction(event) {
    this.animate();
    if (event.ctrlKey) {
      isPolish = !isPolish;
      localStorage.setItem('isPolish', isPolish);
      keys.filter((key) => key instanceof AlphaKey).map((key) => key.renderOtherLang());
    }
  }
}

class ControlKey extends SpecialKey {
  constructor(key, width) {
    super(key, width);
    this.key = 'Control';
    this.alias = 'Ctrl';
  }

  onClickAction() {
    this.animate();
  }
}

class WinKey extends SpecialKey {
  constructor(key, width) {
    super(key, width);
    this.key = 'Meta';
    this.alias = 'Win';
  }

  onClickAction() {
    this.animate();
  }
}

class BlankKey extends SpecialKey {
  constructor(key, width) {
    super(key, width);
    this.key = '';
  }

  onClickAction() {
    this.animate();
  }
}

// function to remove text on bckspace/delete

const backspaceLogic = (obj, key) => {
  const textObject = {
    text: '',
    position: undefined,
  };
  const startPos = obj.selectionStart;
  const endPos = obj.selectionEnd;
  const { length } = obj.value;
  if (startPos < endPos && endPos === length) {
    textObject.text = obj.value.slice(0, startPos);
  }
  if (startPos < endPos && endPos !== length) {
    const array = obj.value.split('');
    array.splice(startPos, endPos - startPos);
    textObject.text = array.join('');
    textObject.position = startPos + 1;
  }
  if (startPos === endPos && startPos === length) {
    if (key === 'Backspace') {
      textObject.text = obj.value.slice(0, startPos - 1);
    } else {
      textObject.text = obj.value;
    }
  }
  if (startPos === endPos && startPos !== length) {
    const array = obj.value.split('');
    if (key === 'Backspace') {
      array.splice(startPos - 1, 1);
      textObject.text = array.join('');
      textObject.position = startPos;
    } else {
      array.splice(startPos, 1);
      textObject.text = array.join('');
      textObject.position = startPos + 1;
    }
  }
  return textObject;
};

// function to add space at space/tab/enter

const EnterLogic = (obj, key) => {
  const textObject = {
    text: '',
    position: undefined,
  };
  const endPos = obj.selectionEnd;
  const { length } = obj.value;
  if (endPos < length) {
    const array = obj.value.split('');
    array.splice(endPos, 0, key);
    textObject.text = array.join('');
    textObject.position = obj.selectionEnd;
  } else {
    textObject.text = obj.value + key;
  }
  return textObject;
};

// instantiating classes for all the keys

const keys = [new NumKey('`', '~'), new NumKey('1', '!'), new NumKey('2', '@'), new NumKey('3', '#'), new NumKey('4', '$'),
  new NumKey('5', '%'), new NumKey('6', '^'), new NumKey('7', '&'), new NumKey('8', '*'), new NumKey('9', '('), new NumKey('0', ')'),
  new NumKey('-', '_'), new NumKey('=', '+'), new Backspace(86), new TabKey(45), new AlphaKey('q'), new AlphaKey('w'), new AlphaKey('e', 'ę'),
  new AlphaKey('r'), new AlphaKey('t'), new AlphaKey('y'), new AlphaKey('u'), new AlphaKey('i'), new AlphaKey('o', 'ó'),
  new AlphaKey('p'), new NumKey('[', '{'), new NumKey(']', '}'), new NumKey('\\', '|'), new Delete(35), new CapsLockKey(86),
  new AlphaKey('a', 'ą'), new AlphaKey('s', 'ś'), new AlphaKey('d'), new AlphaKey('f'), new AlphaKey('g'), new AlphaKey('h'),
  new AlphaKey('j'), new AlphaKey('k'), new AlphaKey('l', 'ł'), new NumKey(';', ':'), new NumKey('\'', '"'), new EnterKey(86),
  new ShiftKey(86), new AlphaKey('z', 'ż'), new AlphaKey('x', 'ź'), new AlphaKey('c', 'ć'), new AlphaKey('v'), new AlphaKey('b'),
  new AlphaKey('n', 'ń'), new AlphaKey('m'), new NumKey(',', '<'), new NumKey('.', '>'), new NumKey('/', '?'), new ArrowUp(),
  new BlankKey(86), new ControlKey(), new WinKey(), new Alt(), new Space(316), new AltGraph(), new ArrowLeft(), new ArrowDown(),
  new ArrowRight(), new BlankKey()];
// rendering virtual keys into the DOM
keys.map((key) => key.render());

// event handlers for real keyboard
const animateVirtualKeys = (e, action) => {
  keys.map((key) => {
    if (e.key.toLowerCase() === key.key.toLowerCase() || e.key === key.shiftkey || e.key.toLowerCase() === key.otherLangAltKey) {
      if (action === 'on') key.onClickAction(e);
      else key.onClickOffAction();
    }
  });
};

window.addEventListener('keydown', (e) => {
  e.preventDefault();
  animateVirtualKeys(e, 'on');
});

window.addEventListener('keyup', (e) => {
  e.preventDefault();
  animateVirtualKeys(e, 'off');
});
