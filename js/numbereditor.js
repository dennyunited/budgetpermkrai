if(typeof String.prototype.trim !== 'function') {
	String.prototype.trim = function() {
		return this.replace(/^\s+|\s+$/g, '');
	}
}

if (typeof Array.prototype.indexOf != 'function') {
	Array.prototype.indexOf = function(obj){
		for(var i=0; i < this.length; i++){
			if (this[i] == obj)
				return i;
		}
		return -1;
	}
}

function toFloat(s){
	return s.replace(/\s/g, '').replace(',', '.').trim()*1;
}

function lastIsDelimiter(s){
	return '.,'.indexOf(s[s.length - 1]) >= 0;
}

function GetCaretPosition (oField) {
	// Initialize
	var iCaretPos = 0;
	// IE Support
	if (document.selection) {
		// Set focus on the element
		// To get cursor position, get empty selection range
		var oSel = document.selection.createRange ();
		// Move selection start to 0 position
		oSel.moveStart ('character', -oField.value.length);
		// The caret position is selection length
		iCaretPos = oSel.text.length;
	}
	// Firefox support
	else if (oField.selectionStart || oField.selectionStart == '0')
		iCaretPos = oField.selectionStart;
	// Return results
	return (iCaretPos);
}

function GetSelectionLength (oField) {
	// IE Support
	if (document.selection) {
		var oSel = document.selection.createRange();
		return oSel.text.length;
	}
	// Firefox support
	else if (oField.selectionEnd)
		return Math.abs(oField.selectionEnd - oField.selectionStart);
	return 0;
}

function moveCaret(el, index) {
	if (el.createTextRange) {
		var range = el.createTextRange();
		range.move("character", index);
		range.select();
	} else if (el.selectionStart != null) {
		el.focus();
		el.setSelectionRange(index, index);
	}
}

/* check for valid key and format input content.
	 * attach this function to keydown event of INPUT element.
	 * <INPUT class='float'/> - value is float (default: integer)
	 * <INPUT precision='3'/> - precision for float (default: 2)
	 * <INPUT maxValue=""/> - max value
	*/
function checkAndFormatNumberOnInputKeyDown(e) {
	if (e.ctrlKey || e.altKey || [35, 36, 37, 38, 39, 40, 9, 13, 16, 116].indexOf(e.which) >= 0) {
		return true;
	}
	var obj = $(this), timerId = obj.data('timerId') || '';
	if (timerId != '')
		clearTimeout(timerId);
	var enabledChars = '0123456789', isFloat = obj.hasClass('float');
	if (isFloat){
		enabledChars += '.,';
	}
	//num keypad
	if (e.which > 95 && e.which < 106)
		e.which = e.which - 48;
	var a = e.char;
	if (!a)
		if((e.which < 48 || e.which > 57))
			a = ''; else
			a = String.fromCharCode(e.which);

	if (e.which == 188 || e.which == 190 || e.which == 110)
		a = ',';


	if (lastIsDelimiter(a))
	{
		if (this.value.indexOf(',') >= 0)
			return false;
		a = ',';
		e.which = 188;
	}

	if (enabledChars.indexOf(a) < 0 && e.which != 8)
		return false;

	var curPos = GetCaretPosition(this),
	selLength = GetSelectionLength(this),
	txt = this.value;
	switch (e.which){
		case 46:
		case 8:
			// BACKSPACE Key
			if (selLength == 0){
				if (e.which == 8)
					curPos--;
				if ($.browser.msie)
					curPos++;
				selLength = 1;
			}
			a = '';
			break;
	}
	if ( selLength > 0)
	{
		if ($.browser.msie && curPos > 0)
		{
			curPos -= selLength;
		}
		txt = txt.substr(0, curPos) + txt.substr(curPos + selLength);
	}

	var p = txt.indexOf(','),
	leftP = txt.substr(0, curPos) + a,
	rightP = txt.substr(curPos).replace(/\s/g, '');

	// remove leading 0
	if (leftP == '') {
		if (rightP[0] == '0' && p != 1 && txt.length > 0){
			rightP = rightP.substr(1);
			p--;
			if (curPos > 0)
				curPos--;
		}
	} else
	if (leftP[0] == '0' && p != 1 && txt.length > 0){
		leftP = leftP.substr(1);
		p--;
		if (curPos > 0)
			curPos--;
	}

	// insert leading 0 for floats < 0
	if (p == 0 || leftP == ','){
		leftP = '0' + leftP;
		p=1;
		curPos++;
	}

	if (isFloat && p > -1 && curPos >= p){
		var prec = obj.attr('precision') || 2;
		if ( txt.length - p > prec)
			return false;
	}

	var clear = leftP.replace(/\s/g, ''),
	full = clear + rightP;

	var mVal = obj.attr('maxValue') || '';
	if (mVal != '' && toFloat(mVal) < toFloat(full))
	{
		return false;
	}
	mVal = obj.attr('minValue') || '';
	if (mVal != '' && toFloat(mVal) > toFloat(full))
	{
		clear = txt = full = mVal;
		p = full.indexOf(',');
		if (p > 0) clear = txt.substr(0, p);
		curPos = full.length;
	}

	var	nP = full.indexOf(','),
	formated = full.substr(nP < 0 ? full.length : nP);

	if (p > curPos)
		p-= (curPos - clear.length);
	curPos = clear.length;
	var c = 1;
	if (p<0)
		p = full.length;

	while((--p) >= 0){
		var ch = full[p];
		if (ch == ',') continue;

		if (c == 3 && p > 0){
			ch = ' ' + ch;
			c = 0;
			if (p <= curPos)
				curPos++;
		}
		c++;
		formated = ch + formated;
	}

	this.value = formated;
	moveCaret(this, curPos);
	// change events doesn't fire cause we are set this.value manually
	timerId = setTimeout(function(){obj.trigger('change');}, 400);
	obj.data('timerId', timerId);
	return false;
}
