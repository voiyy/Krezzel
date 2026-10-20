(() => {
  'use strict';
  const $ = (selector) => document.querySelector(selector);
  const form = $('#letter-form');
  const landing = $('#landing');
  const workspace = $('#workspace');
  const content = $('#letter-content');
  const preview = $('#letter-preview');
  const textEditor = $('#generated-text');
  const notice = $('#preview-notice');
  const toast = $('#toast');
  const resetDialog = $('#reset-dialog');
  const required = ['fullName', 'email', 'jobTitle', 'company'];
  let generatedText = '';
  let toastTimer;

  const dateFor = (language) => new Intl.DateTimeFormat(language === 'id' ? 'id-ID' : 'en-GB', { day: 'numeric', month: 'long', year: 'numeric' }).format(new Date());
  const val = (name) => String(new FormData(form).get(name) || '').trim();
  const escapeForPlainText = (value) => value.replace(/[<>]/g, '');

  function details() {
    return { language: val('language'), template: val('template'), fullName: val('fullName'), email: val('email'), phone: val('phone'), location: val('location'), education: val('education'), jobTitle: val('jobTitle'), company: val('company'), recruiter: val('recruiter'), requirements: val('requirements'), experience: val('experience'), skills: val('skills'), motivation: val('motivation') };
  }
  function isReady(data) { return required.every((field) => data[field]); }
  function validate(showErrors = false) {
    const data = details(); let valid = true;
    required.forEach((name) => {
      const input = $('#' + name); const error = $('#' + name + '-error'); let message = '';
      if (!data[name]) message = 'Bidang ini perlu diisi.';
      if (name === 'email' && data.email && !input.validity.valid) message = 'Masukkan alamat email yang valid.';
      input.setAttribute('aria-invalid', message ? 'true' : 'false');
      error.textContent = message;
      if (message) valid = false;
    });
    return valid;
  }
  function makeLetter(data) {
    const { language: lang } = data;
    const recruiter = data.recruiter || (lang === 'id' ? 'Tim Rekrutmen' : 'Hiring Team');
    const experience = data.experience || (lang === 'id' ? 'latar belakang dan ketertarikan saya yang relevan' : 'relevant background and interest');
    const skills = data.skills ? (lang === 'id' ? ` Saya juga membawa kekuatan dalam ${data.skills}.` : ` I would also bring strengths in ${data.skills}.`) : '';
    const role = data.jobTitle || (lang === 'id' ? '[posisi yang dituju]' : '[target role]');
    const company = data.company || (lang === 'id' ? '[nama perusahaan]' : '[company name]');
    const motivation = data.motivation || (lang === 'id' ? `Saya melihat kesempatan ini sebagai ruang untuk memberi kontribusi yang bermakna di ${company}.` : `I see this opportunity as a meaningful way to contribute to ${company}.`);
    const req = data.requirements ? (lang === 'id' ? ` Saya telah mempertimbangkan kebutuhan posisi ini, termasuk ${data.requirements}, dan ingin menunjukkan kecocokan saya melalui pengalaman yang relevan.` : ` I have considered the role requirements, including ${data.requirements}, and would welcome the chance to demonstrate that fit through my experience.`) : '';
    if (lang === 'id') {
      return `Dengan hormat,\n\nSaya bermaksud mengajukan lamaran untuk posisi ${role} di ${company}. ${motivation}\n\nPengalaman saya dalam ${experience}.${skills}${req}\n\nSaya menghargai kesempatan untuk menjelaskan bagaimana saya dapat mendukung tim ${company} dalam proses seleksi. Terima kasih atas waktu dan pertimbangan Bapak/Ibu.\n\nHormat saya,\n${data.fullName || '[nama lengkap]'}`;
    }
    return `Dear ${recruiter},\n\nI am writing to apply for the ${role} position at ${company}. ${motivation}\n\nMy experience in ${experience}.${skills}${req}\n\nI would value the opportunity to discuss how I could contribute to ${company} in more detail. Thank you for your time and consideration.\n\nSincerely,\n${data.fullName || '[full name]'}`;
  }
  function paragraphs(text) {
    return text.split(/\n\s*\n/).map((p) => p.trim()).filter(Boolean);
  }
  function setText(element, value) { element.textContent = value; return element; }
  function renderPreview() {
    const data = details();
    const ready = isReady(data);
    preview.className = 'letter-page ' + data.template;
    content.replaceChildren();
    if (!ready) {
      const hint = document.createElement('p'); hint.className = 'placeholder'; setText(hint, data.language === 'id' ? 'Lengkapi nama, email, posisi, dan perusahaan untuk melihat surat Anda di sini.' : 'Add your name, email, target role, and company to see your letter here.'); content.append(hint);
      notice.textContent = data.language === 'id' ? 'Lengkapi bidang bertanda * untuk membuat surat yang siap dikirim.' : 'Complete the required fields to create a ready-to-send letter.';
      notice.classList.remove('ready'); return;
    }
    notice.textContent = data.language === 'id' ? 'Siap ditinjau. Edit teks di bawah jika Anda ingin menyempurnakan kata-kata.' : 'Ready to review. Edit the text below if you would like to refine the wording.';
    notice.classList.add('ready');
    const meta = document.createElement('div'); meta.className = 'letter-meta';
    const identity = document.createElement('div'); const name = document.createElement('div'); name.className = 'applicant-name'; setText(name, data.fullName); identity.append(name);
    const contacts = [data.email, data.phone, data.location].filter(Boolean); if (contacts.length) { const c = document.createElement('div'); setText(c, contacts.join(' · ')); identity.append(c); } meta.append(identity);
    if (data.education) { const education = document.createElement('div'); education.className = 'text-right'; setText(education, data.education); meta.append(education); } content.append(meta);
    const date = document.createElement('p'); date.className = 'date'; setText(date, (data.location ? data.location + ', ' : '') + dateFor(data.language)); content.append(date);
    const recipient = document.createElement('p'); recipient.className = 'recipient'; setText(recipient, data.language === 'id' ? `Yth. ${data.recruiter || 'Tim Rekrutmen'}\n${data.company}` : `${data.recruiter || 'Hiring Team'}\n${data.company}`); content.append(recipient);
    if (data.language === 'id') { const subject = document.createElement('p'); subject.className = 'subject'; setText(subject, `Perihal: Lamaran untuk posisi ${data.jobTitle}`); content.append(subject); }
    const pieces = paragraphs(textEditor.value || generatedText);
    pieces.forEach((piece, index) => { const p = document.createElement('p'); p.className = index === 0 || index === pieces.length - 1 ? (index === 0 ? 'salutation' : 'closing') : 'body-copy'; setText(p, escapeForPlainText(piece)); content.append(p); });
  }
  function regenerate() { generatedText = makeLetter(details()); textEditor.value = generatedText; renderPreview(); }
  function showToast(message) { toast.textContent = message; toast.classList.add('show'); clearTimeout(toastTimer); toastTimer = setTimeout(() => toast.classList.remove('show'), 3300); }
  function startWorkspace() { landing.classList.add('hidden'); workspace.classList.remove('hidden'); $('#fullName').focus(); window.scrollTo({ top: 0, behavior: 'smooth' }); renderPreview(); }

  document.querySelectorAll('[data-start]').forEach((button) => button.addEventListener('click', startWorkspace));
  $('#back-to-landing').addEventListener('click', () => { workspace.classList.add('hidden'); landing.classList.remove('hidden'); window.scrollTo({ top: 0, behavior: 'smooth' }); });
  form.addEventListener('input', () => { validate(); regenerate(); });
  form.addEventListener('change', () => { validate(); regenerate(); });
  textEditor.addEventListener('input', renderPreview);
  $('#regenerate').addEventListener('click', regenerate);
  $('#copy-letter').addEventListener('click', async () => {
    if (!validate(true)) { showToast('Lengkapi informasi wajib sebelum menyalin surat.'); return; }
    try { await navigator.clipboard.writeText(textEditor.value); showToast('Teks surat telah disalin.'); }
    catch { textEditor.select(); document.execCommand('copy'); showToast('Teks surat telah disalin.'); }
  });
  function printLetter() { if (!validate(true)) { showToast('Lengkapi informasi wajib sebelum mencetak.'); return; } window.print(); }
  $('#print-letter').addEventListener('click', printLetter);
  $('#export-pdf').addEventListener('click', () => { if (!validate(true)) { showToast('Lengkapi informasi wajib sebelum menyimpan PDF.'); return; } showToast('Pilih “Save as PDF” di dialog cetak browser Anda.'); window.setTimeout(() => window.print(), 250); });
  $('#new-letter').addEventListener('click', () => resetDialog.showModal());
  $('#cancel-reset').addEventListener('click', () => resetDialog.close());
  $('#confirm-reset').addEventListener('click', () => { form.reset(); textEditor.value = ''; generatedText = ''; resetDialog.close(); validate(); renderPreview(); showToast('Isian surat telah dihapus.'); });
  document.querySelectorAll('[data-mobile-view]').forEach((button) => button.addEventListener('click', () => { document.querySelectorAll('[data-mobile-view]').forEach((tab) => { const selected = tab === button; tab.classList.toggle('active', selected); tab.setAttribute('aria-selected', String(selected)); }); $('.workspace-grid').classList.toggle('preview-mode', button.dataset.mobileView === 'preview'); $('.workspace-grid').classList.toggle('form-mode', button.dataset.mobileView === 'form'); }));
  regenerate();
})();
