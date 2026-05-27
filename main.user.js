// ==UserScript==
// @name         main.user.js
// @namespace    gh
// @version      v01
// @description  Helper script for Twins
// @author       ...
// @match        Paste the Twins URL here.
// @icon         https://www.google.com/s2/favicons?sz=64&domain=visualstudio.com
// @resource     twinsHelperStyle https://cdn.jsdelivr.net/gh/omurbilgin/TwinsHelper@main/style.css
// @grant        GM_addStyle
// @grant        GM_getResourceText
// ==/UserScript==

(function() {
    'use strict';

    function loadTwinsHelperStyle() {
        const css = GM_getResourceText('twinsHelperStyle');
        GM_addStyle(css);
    }

    function createTwinsHelperPanel() {
        if (document.getElementById('twins-helper-panel')) {
            return;
        }

        const panel = document.createElement('div');
        panel.id = 'twins-helper-panel';

        panel.innerHTML = `
            <div class="twins-helper-header">
                <div class="twins-helper-title">Twins Helper</div>
                <div class="twins-helper-actions">
                    <button type="button" class="twins-helper-icon-btn" id="twins-helper-toggle" title="Paneli ac/kapat">-</button>
                </div>
            </div>
            <div class="twins-helper-body">
                <textarea class="twins-helper-textarea" id="twins-helper-warning-text" placeholder="Warning text"></textarea>
                <textarea class="twins-helper-textarea" id="twins-helper-hostname" placeholder="Hostname"></textarea>
                <div class="twins-helper-checkbox-row">
                    <label class="twins-helper-checkbox-label">
                        <input type="checkbox" id="twins-helper-add-warning">
                        <span>Add Warning</span>
                    </label>
                    <label class="twins-helper-checkbox-label">
                        <input type="checkbox" id="twins-helper-add-hostname">
                        <span>Add Hostname</span>
                    </label>
                </div>
            </div>
            <div class="twins-helper-footer">
                <button type="button" class="twins-helper-update-btn" id="twins-helper-update">Update</button>
            </div>
        `;

        document.body.appendChild(panel);

        const header = panel.querySelector('.twins-helper-header');
        const toggleButton = panel.querySelector('#twins-helper-toggle');

        toggleButton.addEventListener('click', function () {
            panel.classList.toggle('is-collapsed');
            toggleButton.textContent = panel.classList.contains('is-collapsed') ? '+' : '-';
        });

        panel.querySelector('#twins-helper-update').addEventListener('click', updateMailForm);

        makePanelDraggable(panel, header);
    }

    function makePanelDraggable(panel, handle) {
        let isDragging = false;
        let startX = 0;
        let startY = 0;
        let startLeft = 0;
        let startTop = 0;

        handle.addEventListener('mousedown', function (event) {
            if (event.target.closest('button')) {
                return;
            }

            isDragging = true;
            startX = event.clientX;
            startY = event.clientY;

            const rect = panel.getBoundingClientRect();
            startLeft = rect.left;
            startTop = rect.top;

            panel.style.left = `${startLeft}px`;
            panel.style.top = `${startTop}px`;
            panel.style.right = 'auto';

            document.body.style.userSelect = 'none';
        });

        document.addEventListener('mousemove', function (event) {
            if (!isDragging) {
                return;
            }

            const nextLeft = startLeft + event.clientX - startX;
            const nextTop = startTop + event.clientY - startY;

            panel.style.left = `${Math.max(0, nextLeft)}px`;
            panel.style.top = `${Math.max(0, nextTop)}px`;
        });

        document.addEventListener('mouseup', function () {
            if (!isDragging) {
                return;
            }

            isDragging = false;
            document.body.style.userSelect = '';
        });
    }

    function updateMailForm() {
        // Get Customer Name
        const editor = document.getElementById('editor');
        const customerNameCell = Array.from(editor.querySelectorAll('td'))
        .find(td => normalizeText(td.textContent.trim()) === normalizeText('Customers'));
        const customerName = customerNameCell?.nextElementSibling?.textContent.trim();

        const warningText = document.getElementById('twins-helper-warning-text').value.trim();
        const hostname = document.getElementById('twins-helper-hostname').value.trim();

        updateSubject(customerName, warningText, hostname);
        updateEditorTableCell('Uyari', warningText);
        updateEditorTableCell('Hostname', hostname);
        updateEditorIntroText();
        removeEditorTableRow('Date');
        addRegardsAfterTable();
        syncEditorCopy();
        alert('Mail Updated!');
    }

    function updateSubject(customerName, warningText, hostname) {
        const subjectInput = document.querySelector('input[name="subject"]');
        const isAddWarning = document.getElementById('twins-helper-add-warning').checked;
        const isAddHostname = document.getElementById('twins-helper-add-hostname').checked;

        if (!subjectInput) {
            return;
        }

        let subjectValue = customerName;

        if (isAddHostname && hostname) {
            subjectValue += ' - ' + hostname;
        }

        if (isAddWarning && warningText) {
            subjectValue += ' - ' + warningText;
        }

        subjectValue += " - Uyarısı Hk.";

        subjectInput.value = subjectValue.replace(/\n/g, ' & ');
        subjectInput.dispatchEvent(new Event('input', { bubbles: true }));
        subjectInput.dispatchEvent(new Event('change', { bubbles: true }));
    }

    function updateEditorTableCell(labelText, value) {
        const editor = document.getElementById('editor');

        if (!editor) {
            return;
        }

        const labelCell = Array.from(editor.querySelectorAll('td')).find(function (cell) {
            return normalizeText(cell.textContent) === normalizeText(labelText);
        });

        if (!labelCell) {
            return;
        }

        const row = labelCell.closest('tr');

        if (!row) {
            return;
        }

        const cells = row.querySelectorAll('td');
        const valueCell = cells[1];

        if (!valueCell) {
            return;
        }

        valueCell.innerHTML = '';
        valueCell.innerHTML = value.replace(/\n/g, '<br>');
    }

    function removeEditorTableRow(labelText) {
        const editor = document.getElementById('editor');

        if (!editor) {
            return;
        }

        const labelCell = Array.from(editor.querySelectorAll('td')).find(function (cell) {
            return normalizeText(cell.textContent) === normalizeText(labelText);
        });

        const row = labelCell?.closest('tr');

        if (row) {
            row.remove();
        }
    }

    function addRegardsAfterTable() {
        const editor = document.getElementById('editor');

        if (!editor || editor.textContent.includes('Saygılarımla,')) {
            return;
        }

        editor.innerHTML = editor.innerHTML.replace(
            /<\/table>(?:\s|<br\s*\/?>)*/i,
            '</table><br>Saygılarımla,<br><br>'
        );
    }

    function updateEditorIntroText() {
        const editor = document.getElementById('editor');

        if (!editor) {
            return;
        }

        editor.innerHTML = editor.innerHTML.replace(
            /Sistem\s+üzerinden\s+"[^"]*"\s+uyarısı\s+alınmaktadır\.\s*Kontrol\s+edebilir\s+misiniz\?(?:\s*<br\s*\/?>){0,4}/i,
            'Sistem üzerinden tablodaki uyarı alınmaktadır.<br>Kontrol edebilir misiniz?<br><br>'
        );
    }

    function normalizeText(text) {
        return text
            .trim()
            .toLowerCase()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .replaceAll('\u0131', 'i')
            .replaceAll('\u0130', 'i')
            .replaceAll('\u00e4\u00b1', 'i')
            .replaceAll('\u00c4\u00b1', 'i')
            .replaceAll('\u00c4\u00b0', 'i');
    }

    function syncEditorCopy() {
        const editor = document.getElementById('editor');
        const editorCopy = document.getElementById('editorCopy');

        if (!editor || !editorCopy) {
            return;
        }

        editorCopy.value = editor.innerHTML;
        editor.dispatchEvent(new Event('input', { bubbles: true }));
    }

    loadTwinsHelperStyle();
    createTwinsHelperPanel();
})();