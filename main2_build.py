import tkinter as tk
from pathlib import Path
from tkinter import filedialog, messagebox, ttk

from database2 import delete_student, get_rank, get_student, get_topper, save_student, search_students
from grade2 import grade_point_color
from report2 import export_student_report
from result2 import analyze_result
from student2 import build_student_record, validate_student_identity


class PerformanceApp:
    def __init__(self, root):
        self.root = root
        self.root.title('Student Performance & Grade Analyzer Pro')
        self.root.geometry('1450x860')
        self.root.minsize(1240, 760)
        self.root.configure(bg='#eaf1f8')
        self.palette = {
            'bg': '#eaf1f8', 'panel': '#ffffff', 'soft': '#f5f8fc', 'navy': '#16324f',
            'blue': '#1f6feb', 'teal': '#0f9d8a', 'red': '#d9534f', 'amber': '#f39c12',
            'text': '#22313f', 'muted': '#64748b', 'line': '#d7e2ee', 'weak': '#fff3e8',
            'green_soft': '#dcfce7', 'blue_soft': '#dbeafe', 'amber_soft': '#fef3c7', 'red_soft': '#fee2e2'
        }
        self.subjects = []
        self.current_record = None
        self.student_rows = []
        self.search_var = tk.StringVar()
        self.status_var = tk.StringVar(value='Ready. Add subjects, calculate, then save one or many students.')
        self._setup_style()
        self._build_ui()
        self._bind_keys()
        self.refresh_student_table()
        self._animate_cards()

    def _setup_style(self):
        style = ttk.Style()
        try:
            style.theme_use('clam')
        except tk.TclError:
            pass
        style.configure('.', font=('Segoe UI', 10))
        style.configure('App.Treeview', background='white', foreground=self.palette['text'], fieldbackground='white', rowheight=30, borderwidth=0)
        style.map('App.Treeview', background=[('selected', '#dceafe')], foreground=[('selected', self.palette['navy'])])
        style.configure('App.Treeview.Heading', background=self.palette['soft'], foreground=self.palette['navy'], font=('Segoe UI', 10, 'bold'), relief='flat')
        style.configure('Accent.Horizontal.TProgressbar', troughcolor=self.palette['soft'], background=self.palette['blue'])

    def _build_ui(self):
        self._build_header()
        body = tk.Frame(self.root, bg=self.palette['bg'])
        body.pack(fill='both', expand=True, padx=18, pady=16)
        body.grid_columnconfigure(0, weight=2)
        body.grid_columnconfigure(1, weight=3)
        body.grid_rowconfigure(0, weight=1)
        body.grid_rowconfigure(1, weight=2)
        self._build_entry_panel(body)
        self._build_summary_panel(body)
        self._build_result_panel(body)
        self._build_records_panel(body)
        footer = tk.Frame(self.root, bg=self.palette['navy'], height=34)
        footer.pack(fill='x', side='bottom')
        footer.pack_propagate(False)
        tk.Label(footer, textvariable=self.status_var, font=('Segoe UI', 9), fg='white', bg=self.palette['navy'], anchor='w').pack(fill='both', padx=14)

    def _build_header(self):
        header = tk.Frame(self.root, bg=self.palette['navy'], height=110)
        header.pack(fill='x')
        header.pack_propagate(False)
        left = tk.Frame(header, bg=self.palette['navy'])
        left.pack(side='left', padx=24, pady=12)
        tk.Label(left, text='Student Performance & Grade Analyzer', font=('Segoe UI', 24, 'bold'), fg='white', bg=self.palette['navy']).pack(anchor='w')
        tk.Label(left, text='Add multiple students, save detailed results, compare performance, search records, and find the topper.', font=('Segoe UI', 10), fg='#d6e3f2', bg=self.palette['navy']).pack(anchor='w', pady=(4, 0))
        hero = tk.Canvas(header, width=210, height=82, bg=self.palette['navy'], highlightthickness=0)
        hero.pack(side='right', padx=24)
        hero.create_oval(8, 12, 68, 72, fill='#214c7a', outline='')
        hero.create_oval(58, 2, 140, 76, fill='#2d6db2', outline='')
        hero.create_oval(128, 18, 202, 80, fill='#0f9d8a', outline='')
        hero.create_text(72, 40, text='i', font=('Segoe UI', 24, 'bold'), fill='white')
        hero.create_text(170, 48, text='★', font=('Segoe UI', 24, 'bold'), fill='white')
        tk.Label(header, bitmap='info', bg=self.palette['navy'], fg='white').place(x=20, y=20)

    def _panel(self, parent, row, column, padx=(0, 0), pady=(0, 0)):
        frame = tk.Frame(parent, bg=self.palette['panel'], bd=1, relief='solid', highlightbackground=self.palette['line'], highlightthickness=1)
        frame.grid(row=row, column=column, sticky='nsew', padx=padx, pady=pady)
        return frame

    def _entry(self, parent, label, row, column):
        wrap = tk.Frame(parent, bg=self.palette['panel'])
        wrap.grid(row=row, column=column, sticky='ew', padx=18, pady=6)
        wrap.grid_columnconfigure(0, weight=1)
        tk.Label(wrap, text=label, font=('Segoe UI', 9, 'bold'), bg=self.palette['panel'], fg=self.palette['text']).grid(row=0, column=0, sticky='w', pady=(0, 6))
        entry = ttk.Entry(wrap, font=('Segoe UI', 11))
        entry.grid(row=1, column=0, sticky='ew', ipady=6)
        return entry

    def _button(self, parent, text, command, color, small=False):
        btn = tk.Button(parent, text=text, command=command, bg=color, fg='white', activebackground=self._shade(color, 0.9), activeforeground='white', relief='flat', bd=0, cursor='hand2', font=('Segoe UI', 9 if small else 10, 'bold'), padx=12, pady=7 if small else 10)
        btn.bind('<Enter>', lambda e, ref=btn, base=color: ref.config(bg=self._shade(base, 0.92)))
        btn.bind('<Leave>', lambda e, ref=btn, base=color: ref.config(bg=base))
        return btn

    def _build_entry_panel(self, parent):
        panel = self._panel(parent, 0, 0, padx=(0, 12), pady=(0, 12))
        panel.grid_columnconfigure(0, weight=1)
        panel.grid_columnconfigure(1, weight=1)
        panel.grid_rowconfigure(8, weight=1)
        tk.Label(panel, text='Add Student', font=('Segoe UI', 15, 'bold'), bg=self.palette['panel'], fg=self.palette['navy']).grid(row=0, column=0, columnspan=2, sticky='w', padx=18, pady=(16, 4))
        tk.Label(panel, text='Fill student details, add subject entries, then calculate and save.', font=('Segoe UI', 9), bg=self.palette['panel'], fg=self.palette['muted']).grid(row=1, column=0, columnspan=2, sticky='w', padx=18, pady=(0, 12))
        self.name_entry = self._entry(panel, 'Student Name', 2, 0)
        self.roll_entry = self._entry(panel, 'Seat Number', 2, 1)
        self.subject_entry = self._entry(panel, 'Subject Code', 4, 0)
        self.marks_entry = self._entry(panel, 'Marks (0-100)', 4, 1)
        self.credit_entry = self._entry(panel, 'Credit', 6, 0)
        actions = tk.Frame(panel, bg=self.palette['panel'])
        actions.grid(row=6, column=1, sticky='ew', padx=18, pady=(18, 0))
        actions.grid_columnconfigure((0, 1), weight=1)
        self._button(actions, 'Add Subject', self.add_subject, self.palette['blue']).grid(row=0, column=0, padx=(0, 6), sticky='ew')
        self._button(actions, 'Calculate Result', self.calculate_result, self.palette['teal']).grid(row=0, column=1, padx=(6, 0), sticky='ew')
        self._button(actions, 'Add Student', self.save_current_student, self.palette['navy']).grid(row=1, column=0, padx=(0, 6), pady=(10, 0), sticky='ew')
        self._button(actions, 'Save And Next', self.save_and_next_student, self.palette['amber']).grid(row=1, column=1, padx=(6, 0), pady=(10, 0), sticky='ew')
        self._button(actions, 'Reset Form', self.clear_form, self.palette['red']).grid(row=2, column=0, columnspan=2, pady=(10, 0), sticky='ew')
        self.progress = ttk.Progressbar(panel, style='Accent.Horizontal.TProgressbar', mode='determinate', length=100, maximum=100)
        self.progress.grid(row=7, column=0, columnspan=2, sticky='ew', padx=18, pady=(16, 0))
        queue = tk.Frame(panel, bg=self.palette['soft'])
        queue.grid(row=8, column=0, columnspan=2, sticky='nsew', padx=18, pady=18)
        queue.grid_columnconfigure(0, weight=1)
        queue.grid_rowconfigure(1, weight=1)
        tk.Label(queue, text='Pending Subjects', font=('Segoe UI', 11, 'bold'), bg=self.palette['soft'], fg=self.palette['navy']).grid(row=0, column=0, sticky='w', padx=12, pady=(12, 6))
        self.subject_listbox = tk.Listbox(queue, height=8, font=('Consolas', 10), bd=0, highlightthickness=0, activestyle='none')
        self.subject_listbox.grid(row=1, column=0, sticky='nsew', padx=12, pady=(0, 8))
        self.subject_listbox.bind('<Delete>', lambda event: self.remove_selected_subject())
        q_actions = tk.Frame(queue, bg=self.palette['soft'])
        q_actions.grid(row=2, column=0, sticky='ew', padx=12, pady=(0, 12))
        q_actions.grid_columnconfigure((0, 1), weight=1)
        self._button(q_actions, 'Remove Selected', self.remove_selected_subject, self.palette['red'], True).grid(row=0, column=0, padx=(0, 6), sticky='ew')
        self._button(q_actions, 'Clear Subjects', self.clear_subjects_only, self.palette['navy'], True).grid(row=0, column=1, padx=(6, 0), sticky='ew')

    def _stat_card(self, parent, row, column, title, value, bg, accent, icon):
        card = tk.Frame(parent, bg=bg)
        card.grid(row=row, column=column, sticky='nsew', padx=8, pady=8)
        self.cards.append(card)
        tk.Frame(card, bg=accent, width=6).pack(side='left', fill='y')
        content = tk.Frame(card, bg=bg)
        content.pack(fill='both', expand=True, padx=12, pady=12)
        top = tk.Frame(content, bg=bg)
        top.pack(fill='x')
        tk.Label(top, bitmap=icon, bg=bg, fg=accent).pack(side='left')
        tk.Label(top, text=title, font=('Segoe UI', 10, 'bold'), bg=bg, fg=self.palette['muted']).pack(side='left', padx=(8, 0))
        value_label = tk.Label(content, text=value, font=('Segoe UI', 20, 'bold'), bg=bg, fg=self.palette['navy'])
        value_label.pack(anchor='w', pady=(8, 0))
        card.value_label = value_label
        card.accent = accent
        return card
    def _build_summary_panel(self, parent):
        panel = self._panel(parent, 0, 1, pady=(0, 12))
        panel.grid_columnconfigure((0, 1, 2, 3), weight=1)
        tk.Label(panel, text='Live Analysis', font=('Segoe UI', 15, 'bold'), bg=self.palette['panel'], fg=self.palette['navy']).grid(row=0, column=0, columnspan=4, sticky='w', padx=18, pady=(16, 4))
        tk.Label(panel, text='Grade analyzer cards, recommendation insights, and saved result summary.', font=('Segoe UI', 9), bg=self.palette['panel'], fg=self.palette['muted']).grid(row=1, column=0, columnspan=4, sticky='w', padx=18, pady=(0, 14))
        self.cards = []
        self.sgpa_card = self._stat_card(panel, 2, 0, 'SGPA', '--', self.palette['blue_soft'], self.palette['blue'], 'info')
        self.rank_card = self._stat_card(panel, 2, 1, 'Rank', '--', self.palette['green_soft'], self.palette['teal'], 'question')
        self.status_card = self._stat_card(panel, 2, 2, 'Status', 'Pending', self.palette['amber_soft'], self.palette['amber'], 'warning')
        self.cp_card = self._stat_card(panel, 2, 3, 'Credit Points', '0', self.palette['red_soft'], self.palette['red'], 'hourglass')
        info = tk.Frame(panel, bg=self.palette['soft'])
        info.grid(row=3, column=0, columnspan=2, sticky='nsew', padx=18, pady=(16, 18))
        info.grid_columnconfigure(0, weight=1)
        self.result_banner = tk.Label(info, text='Calculate result to preview grade analysis.', font=('Segoe UI', 11, 'bold'), bg=self.palette['soft'], fg=self.palette['navy'], anchor='w', padx=14, pady=12)
        self.result_banner.grid(row=0, column=0, sticky='ew')
        self.summary_label = tk.Label(info, text='Subjects: 0 | Credits: 0 | Weak Subjects: 0', font=('Segoe UI', 10), bg=self.palette['soft'], fg=self.palette['muted'], anchor='w', padx=14, pady=8)
        self.summary_label.grid(row=1, column=0, sticky='ew')
        self.advice_label = tk.Label(info, text='Advice: Enter subjects to see grade-based guidance.', font=('Segoe UI', 10), bg=self.palette['soft'], fg=self.palette['muted'], anchor='w', padx=14, pady=8)
        self.advice_label.grid(row=2, column=0, sticky='ew')
        analyzer = tk.Frame(panel, bg=self.palette['soft'])
        analyzer.grid(row=3, column=2, columnspan=2, sticky='nsew', padx=(0, 18), pady=(16, 18))
        analyzer.grid_columnconfigure(0, weight=1)
        tk.Label(analyzer, text='Grade Analyzer', font=('Segoe UI', 11, 'bold'), bg=self.palette['soft'], fg=self.palette['navy']).grid(row=0, column=0, sticky='w', padx=14, pady=(12, 6))
        self.grade_canvas = tk.Canvas(analyzer, height=120, bg=self.palette['soft'], highlightthickness=0)
        self.grade_canvas.grid(row=1, column=0, sticky='nsew', padx=10, pady=(0, 10))
        self.grade_note = tk.Label(analyzer, text='No grade distribution yet.', font=('Segoe UI', 10), bg=self.palette['soft'], fg=self.palette['muted'], anchor='w', padx=14, pady=6)
        self.grade_note.grid(row=2, column=0, sticky='ew')

    def _build_result_panel(self, parent):
        panel = self._panel(parent, 1, 0, padx=(0, 12))
        panel.grid_columnconfigure(0, weight=1)
        panel.grid_rowconfigure(1, weight=1)
        tk.Label(panel, text='Detailed Result Table', font=('Segoe UI', 15, 'bold'), bg=self.palette['panel'], fg=self.palette['navy']).grid(row=0, column=0, sticky='w', padx=18, pady=(16, 10))
        columns = ('Code', 'Marks', 'Credit', 'Grade', 'GP', 'CP', 'Remark')
        self.result_tree = ttk.Treeview(panel, columns=columns, show='headings', style='App.Treeview')
        for column, width in (('Code', 110), ('Marks', 80), ('Credit', 80), ('Grade', 80), ('GP', 70), ('CP', 90), ('Remark', 150)):
            self.result_tree.heading(column, text=column)
            self.result_tree.column(column, width=width, anchor='center')
        self.result_tree.grid(row=1, column=0, sticky='nsew', padx=18, pady=(0, 16))
        self.result_tree.tag_configure('weak', background=self.palette['weak'])
        self.result_tree.tag_configure('strong', background='#ecfdf5')

    def _build_records_panel(self, parent):
        panel = self._panel(parent, 1, 1)
        panel.grid_columnconfigure(0, weight=1)
        panel.grid_rowconfigure(2, weight=1)
        top = tk.Frame(panel, bg=self.palette['panel'])
        top.grid(row=0, column=0, sticky='ew', padx=18, pady=(16, 8))
        top.grid_columnconfigure(0, weight=1)
        top.grid_columnconfigure(1, weight=1)
        tk.Label(top, text='Saved Student Records', font=('Segoe UI', 15, 'bold'), bg=self.palette['panel'], fg=self.palette['navy']).grid(row=0, column=0, sticky='w')
        search_box = ttk.Entry(top, textvariable=self.search_var, font=('Segoe UI', 10))
        search_box.grid(row=0, column=1, sticky='ew', padx=(12, 0))
        search_box.bind('<KeyRelease>', lambda event: self.refresh_student_table())
        actions = tk.Frame(panel, bg=self.palette['panel'])
        actions.grid(row=1, column=0, sticky='ew', padx=18, pady=(0, 10))
        actions.grid_columnconfigure((0, 1, 2, 3), weight=1)
        self._button(actions, 'Search Student', self.refresh_student_table, self.palette['blue'], True).grid(row=0, column=0, padx=(0, 6), sticky='ew')
        self._button(actions, 'Load Result', self.load_selected_student, self.palette['navy'], True).grid(row=0, column=1, padx=6, sticky='ew')
        self._button(actions, 'Compare Selected', self.compare_selected_students, self.palette['amber'], True).grid(row=0, column=2, padx=6, sticky='ew')
        self._button(actions, 'Show Topper', self.show_topper, self.palette['teal'], True).grid(row=0, column=3, padx=(6, 0), sticky='ew')
        self._button(actions, 'Delete Student', self.delete_selected_student, self.palette['red'], True).grid(row=1, column=0, columnspan=4, pady=(10, 0), sticky='ew')
        columns = ('Rank', 'Seat No', 'Name', 'SGPA', 'Status', 'Credits', 'Updated')
        self.student_tree = ttk.Treeview(panel, columns=columns, show='headings', style='App.Treeview', selectmode='extended')
        for column, width in (('Rank', 70), ('Seat No', 120), ('Name', 180), ('SGPA', 80), ('Status', 80), ('Credits', 80), ('Updated', 150)):
            self.student_tree.heading(column, text=column)
            self.student_tree.column(column, width=width, anchor='center' if column != 'Name' else 'w')
        self.student_tree.grid(row=2, column=0, sticky='nsew', padx=18, pady=(0, 18))
        self.student_tree.bind('<Double-1>', lambda event: self.load_selected_student())

    def _bind_keys(self):
        self.root.bind('<Control-s>', lambda event: self.add_subject())
        self.root.bind('<Control-Return>', lambda event: self.calculate_result())
        self.root.bind('<Control-Shift-s>', lambda event: self.save_current_student())
        self.root.bind('<F5>', lambda event: self.refresh_student_table())

    def _shade(self, color, factor):
        color = color.lstrip('#')
        rgb = [max(0, min(255, int(int(color[index:index + 2], 16) * factor))) for index in (0, 2, 4)]
        return f'#{rgb[0]:02x}{rgb[1]:02x}{rgb[2]:02x}'

    def _animate_cards(self):
        for index, card in enumerate(self.cards):
            self.root.after(120 * index, lambda ref=card: ref.config(highlightbackground=ref.accent, highlightthickness=1))
            self.root.after(360 + 120 * index, lambda ref=card: ref.config(highlightthickness=0))

    def _pulse_banner(self, ok=True):
        colors = ['#dcfce7', '#ecfdf5'] if ok else ['#fee2e2', '#fef2f2']
        fg = self.palette['teal'] if ok else self.palette['red']
        def step(index=0):
            if index >= len(colors):
                self.result_banner.config(bg=self.palette['soft'], fg=fg)
                return
            self.result_banner.config(bg=colors[index], fg=fg)
            self.root.after(120, lambda: step(index + 1))
        step()

    def _set_status(self, message):
        self.status_var.set(message)

    def _student_identity(self):
        return validate_student_identity(self.name_entry.get(), self.roll_entry.get())

    def add_subject(self):
        try:
            code = self.subject_entry.get().strip().upper()
            marks_text = self.marks_entry.get().strip()
            credit_text = self.credit_entry.get().strip()
            if not code:
                raise ValueError('Enter a subject code.')
            if not marks_text or not credit_text:
                raise ValueError('Enter marks and credit.')
            marks = int(marks_text)
            credit = int(credit_text)
            if not code.replace('-', '').isalnum():
                raise ValueError('Subject code should be alphanumeric.')
            if not 0 <= marks <= 100:
                raise ValueError('Marks must be between 0 and 100.')
            if not 1 <= credit <= 10:
                raise ValueError('Credit must be between 1 and 10.')
            if any(item[0] == code for item in self.subjects):
                raise ValueError('This subject is already in the queue.')
            self.subjects.append((code, marks, credit))
            self.subjects.sort(key=lambda item: item[0])
            self.refresh_subject_list()
            self._update_progress()
            for entry in (self.subject_entry, self.marks_entry, self.credit_entry):
                entry.delete(0, tk.END)
            self.subject_entry.focus_set()
            self._set_status(f'{code} added successfully.')
        except ValueError as error:
            messagebox.showerror('Validation Error', str(error))

    def refresh_subject_list(self):
        self.subject_listbox.delete(0, tk.END)
        for code, marks, credit in self.subjects:
            self.subject_listbox.insert(tk.END, f'{code:<10} Marks: {marks:<3} Credit: {credit}')

    def _update_progress(self):
        self.progress['value'] = min(len(self.subjects) * 20, 100)

    def clear_subjects_only(self):
        self.subjects.clear()
        self.refresh_subject_list()
        self._update_progress()
        self._set_status('Pending subject queue cleared.')

    def remove_selected_subject(self):
        selection = self.subject_listbox.curselection()
        if not selection:
            messagebox.showinfo('Remove Subject', 'Select a subject from the list first.')
            return
        removed = self.subjects.pop(selection[0])
        self.refresh_subject_list()
        self._update_progress()
        self._set_status(f'{removed[0]} removed from the pending queue.')
    def calculate_result(self):
        try:
            name, roll = self._student_identity()
            analysis = analyze_result(self.subjects)
            self.current_record = build_student_record(name, roll, self.subjects, analysis)
            self.current_record['rank'] = get_rank(roll) or '-'
            self._show_record(self.current_record)
            self._set_status(f'Result preview ready for {name}. Click Add Student to save.')
            return self.current_record
        except Exception as error:
            messagebox.showerror('Calculation Error', str(error))
            self._set_status('Calculation failed. Review the entered data and try again.')
            return None

    def _show_record(self, record):
        self.name_entry.delete(0, tk.END)
        self.name_entry.insert(0, record['name'])
        self.roll_entry.delete(0, tk.END)
        self.roll_entry.insert(0, record['roll'])
        self._populate_result_tree(record['result_rows'], record['weak_subjects'])
        self.sgpa_card.value_label.config(text=f"{record['sgpa']:.2f}", fg=self.palette['navy'])
        self.rank_card.value_label.config(text=str(record.get('rank') or '-'))
        self.status_card.value_label.config(text=record['status'], fg=self.palette['teal'] if record['status'] == 'PASS' else self.palette['red'])
        self.cp_card.value_label.config(text=str(record['total_cp']))
        self.summary_label.config(text=f"Subjects: {len(record['result_rows'])} | Credits: {record['total_credits']} | Weak Subjects: {len(record['weak_subjects'])}")
        self.result_banner.config(text=f"{record['name']} ({record['roll']}) scored SGPA {record['sgpa']:.2f} | {record['status']}")
        self.advice_label.config(text=f"Advice: {record['performance_band']} | Strongest grade band: {record['strongest_grade']}")
        self._draw_grade_analysis(record['grade_counter'])
        self._pulse_banner(record['status'] == 'PASS')

    def _draw_grade_analysis(self, grade_counter):
        self.grade_canvas.delete('all')
        if not grade_counter:
            self.grade_note.config(text='No grade distribution yet.')
            return
        grades = ['O', 'A+', 'A', 'B+', 'B', 'C', 'P', 'F']
        max_count = max(grade_counter.values()) or 1
        start_x = 20
        bar_width = 34
        gap = 12
        base_y = 90
        for index, grade in enumerate(grades):
            count = grade_counter.get(grade, 0)
            x1 = start_x + index * (bar_width + gap)
            x2 = x1 + bar_width
            height = 70 * count / max_count if count else 4
            color = grade_point_color(grade)
            self.grade_canvas.create_rectangle(x1, base_y - height, x2, base_y, fill=color, outline='')
            self.grade_canvas.create_text((x1 + x2) / 2, base_y + 14, text=grade, font=('Segoe UI', 9, 'bold'), fill=self.palette['navy'])
            self.grade_canvas.create_text((x1 + x2) / 2, base_y - height - 10, text=str(count), font=('Segoe UI', 8), fill=self.palette['text'])
        self.grade_note.config(text='Grade distribution across all subjects for the selected student.')

    def _populate_result_tree(self, rows, weak_subjects):
        for item in self.result_tree.get_children():
            self.result_tree.delete(item)
        for row in rows:
            tag = 'weak' if row['code'] in weak_subjects else 'strong'
            self.result_tree.insert('', tk.END, values=(row['code'], row['marks'], row['credit'], row['grade'], row['gp'], row['cp'], row['remark']), tags=(tag,))

    def save_current_student(self):
        try:
            if not self.current_record or self.current_record['roll'] != self.roll_entry.get().strip():
                self.calculate_result()
            if not self.current_record:
                return
            state = save_student(self.current_record)
            if 'error' in state:
                raise ValueError(state)
            self.current_record['rank'] = get_rank(self.current_record['roll']) or '-'
            self.rank_card.value_label.config(text=str(self.current_record['rank']))
            self.refresh_student_table()
            self._set_status(f"Student {self.current_record['name']} {state} successfully.")
        except Exception as error:
            messagebox.showerror('Save Student', str(error))

    def save_and_next_student(self):
        self.save_current_student()
        if self.current_record:
            self._prepare_next_student()
            self._set_status('Student saved. Form cleared for next student entry.')

    def _prepare_next_student(self):
        for entry in (self.name_entry, self.roll_entry, self.subject_entry, self.marks_entry, self.credit_entry):
            entry.delete(0, tk.END)
        self.subjects.clear()
        self.current_record = None
        self.refresh_subject_list()
        self._update_progress()
        self._populate_result_tree([], [])
        self.grade_canvas.delete('all')
        self.grade_note.config(text='No grade distribution yet.')
        self.result_banner.config(text='Calculate result to preview grade analysis.', bg=self.palette['soft'], fg=self.palette['navy'])
        self.summary_label.config(text='Subjects: 0 | Credits: 0 | Weak Subjects: 0')
        self.advice_label.config(text='Advice: Enter subjects to see grade-based guidance.')
        self.sgpa_card.value_label.config(text='--', fg=self.palette['navy'])
        self.rank_card.value_label.config(text='--')
        self.status_card.value_label.config(text='Pending', fg=self.palette['amber'])
        self.cp_card.value_label.config(text='0')
        self.name_entry.focus_set()

    def refresh_student_table(self):
        for item in self.student_tree.get_children():
            self.student_tree.delete(item)
        self.student_rows = []
        ranked = search_students(self.search_var.get())
        for student in ranked:
            rank = get_rank(student['roll']) or '-'
            student['rank'] = rank
            item_id = self.student_tree.insert('', tk.END, values=(rank, student['roll'], student['name'], f"{float(student['sgpa']):.2f}", student.get('status', '-'), student.get('total_credits', 0), student.get('updated_at', '-')))
            self.student_rows.append((item_id, student))
        self._set_status(f'{len(self.student_rows)} student record(s) shown.')

    def _selected_student(self):
        selection = self.student_tree.selection()
        if not selection:
            return None
        selected_id = selection[0]
        for item_id, row in self.student_rows:
            if item_id == selected_id:
                return row
        return None

    def _selected_students(self):
        selected_ids = set(self.student_tree.selection())
        return [row for item_id, row in self.student_rows if item_id in selected_ids]
    def load_selected_student(self):
        student = self._selected_student()
        if not student:
            messagebox.showinfo('Load Result', 'Select a student record first.')
            return
        stored = get_student(student['roll'])
        if not stored:
            messagebox.showwarning('Load Result', 'Selected student record could not be found.')
            return
        self.subjects = [tuple(subject) for subject in stored.get('subjects', [])]
        self.current_record = stored
        self.refresh_subject_list()
        self._update_progress()
        self._show_record(stored)
        self._set_status(f"Loaded full result for {stored['name']}.")

    def compare_selected_students(self):
        students = self._selected_students()
        if len(students) < 2:
            messagebox.showinfo('Compare Students', 'Select at least 2 students from the records table to compare.')
            return
        topper = get_topper()
        topper_sgpa = float(topper['sgpa']) if topper else 0.0
        best = max(students, key=lambda row: float(row['sgpa']))
        window = tk.Toplevel(self.root)
        window.title('Student Comparison')
        window.geometry('860x450')
        window.configure(bg=self.palette['bg'])
        tk.Label(window, text='Student Comparison Dashboard', font=('Segoe UI', 18, 'bold'), bg=self.palette['bg'], fg=self.palette['navy']).pack(anchor='w', padx=18, pady=(18, 6))
        tk.Label(window, text=f"Best selected: {best['name']} ({best['roll']}) | Overall topper SGPA: {topper_sgpa:.2f}", font=('Segoe UI', 10), bg=self.palette['bg'], fg=self.palette['muted']).pack(anchor='w', padx=18, pady=(0, 12))
        columns = ('Rank', 'Seat No', 'Name', 'SGPA', 'Status', 'Gap', 'Band')
        tree = ttk.Treeview(window, columns=columns, show='headings', style='App.Treeview')
        for column, width in (('Rank', 70), ('Seat No', 120), ('Name', 180), ('SGPA', 90), ('Status', 90), ('Gap', 90), ('Band', 160)):
            tree.heading(column, text=column)
            tree.column(column, width=width, anchor='center' if column != 'Name' else 'w')
        tree.pack(fill='both', expand=True, padx=18, pady=(0, 18))
        tree.tag_configure('best', background='#dcfce7')
        for student in sorted(students, key=lambda row: (-float(row['sgpa']), row['name'])):
            gap = max(topper_sgpa - float(student['sgpa']), 0)
            remark = student.get('performance_band', '-')
            tag = 'best' if student['roll'] == best['roll'] else ''
            tree.insert('', tk.END, values=(student.get('rank', '-'), student['roll'], student['name'], f"{float(student['sgpa']):.2f}", student.get('status', '-'), f"{gap:.2f}", remark), tags=(tag,))
        self._set_status(f'Compared {len(students)} students successfully.')

    def show_topper(self):
        topper = get_topper()
        if not topper:
            messagebox.showwarning('Topper', 'No student records found yet.')
            return
        topper_rank = get_rank(topper['roll']) or 1
        messagebox.showinfo('Top Performer', f"Name   : {topper['name']}\nSeat No: {topper['roll']}\nSGPA   : {float(topper['sgpa']):.2f}\nRank   : {topper_rank}\nStatus : {topper.get('status', '-')}")
        self._set_status(f"Top performer is {topper['name']} with SGPA {float(topper['sgpa']):.2f}.")

    def delete_selected_student(self):
        student = self._selected_student()
        if not student:
            messagebox.showinfo('Delete Student', 'Select a student record to delete.')
            return
        if not messagebox.askyesno('Confirm Delete', f"Delete {student['name']} ({student['roll']}) from records?"):
            return
        state = delete_student(student['roll'])
        if state == 'deleted':
            self.refresh_student_table()
            self._set_status(f"Deleted record for {student['roll']}.")
        elif state == 'not_found':
            messagebox.showwarning('Delete Student', 'The selected record no longer exists.')
        else:
            messagebox.showerror('Delete Student', state)

    def export_report(self):
        if not self.current_record:
            messagebox.showinfo('Export Report', 'Load or calculate a student result first.')
            return
        default_file = Path(__file__).resolve().parent / 'reports' / f"{self.current_record['roll']}_report.txt"
        target_path = filedialog.asksaveasfilename(title='Save Student Report', defaultextension='.txt', initialfile=default_file.name, initialdir=str(default_file.parent), filetypes=[('Text Files', '*.txt')])
        if not target_path:
            return
        generated = export_student_report(self.current_record['name'], self.current_record['roll'], self.current_record['result_rows'], self.current_record['sgpa'], self.current_record.get('rank', '-'), self.current_record['status'], self.current_record['total_cp'])
        Path(target_path).write_text(generated.read_text(encoding='utf-8'), encoding='utf-8')
        messagebox.showinfo('Export Report', f'Report saved to:\n{target_path}')
        self._set_status(f"Report exported for {self.current_record['roll']}.")

    def clear_form(self):
        self._prepare_next_student()
        self.search_var.set('')
        self.refresh_student_table()
        self._set_status('Form cleared and ready for a new student entry.')


def main():
    root = tk.Tk()
    PerformanceApp(root)
    root.mainloop()


if __name__ == '__main__':
    main()
