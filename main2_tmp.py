import tkinter as tk
from pathlib import Path
from tkinter import filedialog, messagebox, ttk

from database2 import delete_student, get_rank, get_topper, load_data, save_student
from report2 import export_student_report
from result import process_result


class PerformanceApp:
    def __init__(self, root):
        self.root = root
        self.root.title('College Student Performance & Grade Analyzer Pro')
        self.root.geometry('1360x820')
        self.root.minsize(1160, 720)
        self.root.configure(bg='#eaf1f8')
        self.palette = {
            'bg': '#eaf1f8', 'panel': '#ffffff', 'soft': '#f5f8fc', 'navy': '#16324f',
            'blue': '#1f6feb', 'teal': '#0f9d8a', 'red': '#d9534f', 'amber': '#f39c12',
            'text': '#22313f', 'muted': '#64748b', 'line': '#d7e2ee', 'weak': '#fff3e8'
        }
        self.subjects = []
        self.current_result = []
        self.current_summary = None
        self.student_rows = []
        self.filter_var = tk.StringVar()
        self.status_var = tk.StringVar(value='Ready. Add student details and subjects to begin.')
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
        style.configure('App.Treeview', background='white', foreground=self.palette['text'], fieldbackground='white', rowheight=30)
        style.map('App.Treeview', background=[('selected', '#dceafe')], foreground=[('selected', self.palette['navy'])])
        style.configure('App.Treeview.Heading', background=self.palette['soft'], foreground=self.palette['navy'], font=('Segoe UI', 10, 'bold'))
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
        header = tk.Frame(self.root, bg=self.palette['navy'], height=88)
        header.pack(fill='x')
        header.pack_propagate(False)
        left = tk.Frame(header, bg=self.palette['navy'])
        left.pack(side='left', padx=24, pady=14)
        tk.Label(left, text='College Student Performance Dashboard', font=('Segoe UI', 22, 'bold'), fg='white', bg=self.palette['navy']).pack(anchor='w')
        tk.Label(left, text='Professional SGPA analysis, rankings, subject insights, and reports', font=('Segoe UI', 10), fg='#d6e3f2', bg=self.palette['navy']).pack(anchor='w', pady=(4, 0))
        right = tk.Frame(header, bg=self.palette['navy'])
        right.pack(side='right', padx=24)
        self.progress = ttk.Progressbar(right, style='Accent.Horizontal.TProgressbar', mode='determinate', length=200, maximum=100)
        self.progress.pack(pady=(20, 6))
        self.quick_status = tk.Label(right, text='No calculation yet', font=('Segoe UI', 10, 'bold'), fg='white', bg=self.palette['navy'])
        self.quick_status.pack(anchor='e')

    def _panel(self, parent, row, col, padx=(0, 0), pady=(0, 0)):
        panel = tk.Frame(parent, bg=self.palette['panel'], bd=1, relief='solid', highlightbackground=self.palette['line'], highlightthickness=1)
        panel.grid(row=row, column=col, sticky='nsew', padx=padx, pady=pady)
        return panel

    def _entry(self, parent, label, row, col):
        wrap = tk.Frame(parent, bg=self.palette['panel'])
        wrap.grid(row=row, column=col, sticky='ew', padx=18, pady=6)
        wrap.grid_columnconfigure(0, weight=1)
        tk.Label(wrap, text=label, font=('Segoe UI', 9, 'bold'), bg=self.palette['panel'], fg=self.palette['text']).grid(row=0, column=0, sticky='w', pady=(0, 6))
        entry = ttk.Entry(wrap, font=('Segoe UI', 11))
        entry.grid(row=1, column=0, sticky='ew', ipady=6)
        return entry

    def _button(self, parent, text, command, color, small=False):
        btn = tk.Button(parent, text=text, command=command, bg=color, fg='white', activebackground=self._shade(color, 0.9), activeforeground='white', relief='flat', bd=0, cursor='hand2', font=('Segoe UI', 9 if small else 10, 'bold'), padx=12, pady=7 if small else 10)
        btn.bind('<Enter>', lambda e, b=btn, c=color: b.config(bg=self._shade(c, 0.92)))
        btn.bind('<Leave>', lambda e, b=btn, c=color: b.config(bg=c))
        return btn

    def _build_entry_panel(self, parent):
        panel = self._panel(parent, 0, 0, padx=(0, 12), pady=(0, 12))
        panel.grid_columnconfigure(0, weight=1)
        panel.grid_columnconfigure(1, weight=1)
        panel.grid_rowconfigure(7, weight=1)
        tk.Label(panel, text='Student Intake', font=('Segoe UI', 15, 'bold'), bg=self.palette['panel'], fg=self.palette['navy']).grid(row=0, column=0, columnspan=2, sticky='w', padx=18, pady=(16, 4))
        tk.Label(panel, text='Add student identity and queue subjects before calculating the result.', font=('Segoe UI', 9), bg=self.palette['panel'], fg=self.palette['muted']).grid(row=1, column=0, columnspan=2, sticky='w', padx=18, pady=(0, 12))
        self.name_entry = self._entry(panel, 'Student Name', 2, 0)
        self.roll_entry = self._entry(panel, 'Seat Number', 2, 1)
        self.subject_entry = self._entry(panel, 'Subject Code', 4, 0)
        self.marks_entry = self._entry(panel, 'Marks (0-100)', 4, 1)
        self.credit_entry = self._entry(panel, 'Credit', 6, 0)
        actions = tk.Frame(panel, bg=self.palette['panel'])
        actions.grid(row=6, column=1, sticky='ew', padx=18, pady=(20, 4))
        actions.grid_columnconfigure((0, 1), weight=1)
        self._button(actions, 'Add Subject', self.add_subject, self.palette['blue']).grid(row=0, column=0, padx=(0, 6), sticky='ew')
        self._button(actions, 'Calculate Result', self.calculate_result, self.palette['teal']).grid(row=0, column=1, padx=(6, 0), sticky='ew')
        self._button(actions, 'Reset Form', self.clear_form, self.palette['red']).grid(row=1, column=0, padx=(0, 6), pady=(10, 0), sticky='ew')
        self._button(actions, 'Export Report', self.export_report, self.palette['amber']).grid(row=1, column=1, padx=(6, 0), pady=(10, 0), sticky='ew')
        queue = tk.Frame(panel, bg=self.palette['soft'])
        queue.grid(row=7, column=0, columnspan=2, sticky='nsew', padx=18, pady=18)
        queue.grid_columnconfigure(0, weight=1)
        queue.grid_rowconfigure(1, weight=1)
        tk.Label(queue, text='Pending Subjects', font=('Segoe UI', 11, 'bold'), bg=self.palette['soft'], fg=self.palette['navy']).grid(row=0, column=0, sticky='w', padx=12, pady=(12, 6))
        self.subject_listbox = tk.Listbox(queue, height=7, font=('Consolas', 10), bd=0, highlightthickness=0, activestyle='none')
        self.subject_listbox.grid(row=1, column=0, sticky='nsew', padx=12, pady=(0, 8))
        self.subject_listbox.bind('<Delete>', lambda e: self.remove_selected_subject())
        q_actions = tk.Frame(queue, bg=self.palette['soft'])
        q_actions.grid(row=2, column=0, sticky='ew', padx=12, pady=(0, 12))
        q_actions.grid_columnconfigure((0, 1), weight=1)
        self._button(q_actions, 'Remove Selected', self.remove_selected_subject, self.palette['red'], True).grid(row=0, column=0, padx=(0, 6), sticky='ew')
        self._button(q_actions, 'Clear Subjects', self.clear_subjects_only, self.palette['navy'], True).grid(row=0, column=1, padx=(6, 0), sticky='ew')

    def _stat_card(self, parent, row, col, title, value, bg, accent):
        card = tk.Frame(parent, bg=bg)
        card.grid(row=row, column=col, sticky='nsew', padx=8, pady=8)
        self.cards.append(card)
        tk.Frame(card, bg=accent, width=6).pack(side='left', fill='y')
        body = tk.Frame(card, bg=bg)
        body.pack(fill='both', expand=True, padx=12, pady=12)
        tk.Label(body, text=title, font=('Segoe UI', 10, 'bold'), bg=bg, fg=self.palette['muted']).pack(anchor='w')
        value_label = tk.Label(body, text=value, font=('Segoe UI', 20, 'bold'), bg=bg, fg=self.palette['navy'])
        value_label.pack(anchor='w', pady=(8, 0))
        card.value_label = value_label
        card.accent = accent
        return card

    def _build_summary_panel(self, parent):
        panel = self._panel(parent, 0, 1, pady=(0, 12))
        panel.grid_columnconfigure((0, 1, 2, 3), weight=1)
        tk.Label(panel, text='Performance Snapshot', font=('Segoe UI', 15, 'bold'), bg=self.palette['panel'], fg=self.palette['navy']).grid(row=0, column=0, columnspan=4, sticky='w', padx=18, pady=(16, 4))
        tk.Label(panel, text='Bootstrap-style cards recreated with native Tkinter for reliability.', font=('Segoe UI', 9), bg=self.palette['panel'], fg=self.palette['muted']).grid(row=1, column=0, columnspan=4, sticky='w', padx=18, pady=(0, 14))
        self.cards = []
        self.sgpa_card = self._stat_card(panel, 2, 0, 'SGPA', '--', '#dbeafe', self.palette['blue'])
        self.rank_card = self._stat_card(panel, 2, 1, 'Rank', '--', '#dcfce7', self.palette['teal'])
        self.status_card = self._stat_card(panel, 2, 2, 'Status', 'Pending', '#fef3c7', self.palette['amber'])
        self.cp_card = self._stat_card(panel, 2, 3, 'Credit Points', '0', '#fee2e2', self.palette['red'])
        info = tk.Frame(panel, bg=self.palette['soft'])
        info.grid(row=3, column=0, columnspan=4, sticky='ew', padx=18, pady=(16, 18))
        info.grid_columnconfigure(0, weight=1)
        self.result_banner = tk.Label(info, text='Result status will appear here after calculation.', font=('Segoe UI', 11, 'bold'), bg=self.palette['soft'], fg=self.palette['navy'], anchor='w', padx=14, pady=12)
        self.result_banner.grid(row=0, column=0, sticky='ew')
        self.summary_label = tk.Label(info, text='Subjects: 0 | Total Credits: 0 | Weak Subjects: 0', font=('Segoe UI', 10), bg=self.palette['soft'], fg=self.palette['muted'], anchor='w', padx=14, pady=8)
        self.summary_label.grid(row=1, column=0, sticky='ew')
    def _build_result_panel(self, parent):
        panel = self._panel(parent, 1, 0, padx=(0, 12))
        panel.grid_columnconfigure(0, weight=1)
        panel.grid_rowconfigure(1, weight=1)
        tk.Label(panel, text='Subject-wise Result Analysis', font=('Segoe UI', 15, 'bold'), bg=self.palette['panel'], fg=self.palette['navy']).grid(row=0, column=0, sticky='w', padx=18, pady=(16, 10))
        cols = ('Code', 'Marks', 'Credit', 'Grade', 'GP', 'CP', 'Remark')
        self.result_tree = ttk.Treeview(panel, columns=cols, show='headings', style='App.Treeview')
        for col, width in (('Code', 110), ('Marks', 80), ('Credit', 80), ('Grade', 80), ('GP', 70), ('CP', 90), ('Remark', 140)):
            self.result_tree.heading(col, text=col)
            self.result_tree.column(col, width=width, anchor='center')
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
        tk.Label(top, text='Student Records', font=('Segoe UI', 15, 'bold'), bg=self.palette['panel'], fg=self.palette['navy']).grid(row=0, column=0, sticky='w')
        ttk.Entry(top, textvariable=self.filter_var, font=('Segoe UI', 10)).grid(row=0, column=1, sticky='e', ipadx=40)
        self.filter_var.trace_add('write', lambda *_: self.refresh_student_table())
        actions = tk.Frame(panel, bg=self.palette['panel'])
        actions.grid(row=1, column=0, sticky='ew', padx=18, pady=(0, 10))
        actions.grid_columnconfigure((0, 1, 2, 3), weight=1)
        self._button(actions, 'Refresh Records', self.refresh_student_table, self.palette['blue'], True).grid(row=0, column=0, padx=(0, 6), sticky='ew')
        self._button(actions, 'Show Topper', self.show_topper, self.palette['teal'], True).grid(row=0, column=1, padx=6, sticky='ew')
        self._button(actions, 'Load Selection', self.load_selected_student, self.palette['navy'], True).grid(row=0, column=2, padx=6, sticky='ew')
        self._button(actions, 'Delete Student', self.delete_selected_student, self.palette['red'], True).grid(row=0, column=3, padx=(6, 0), sticky='ew')
        cols = ('Rank', 'Seat No', 'Name', 'SGPA')
        self.student_tree = ttk.Treeview(panel, columns=cols, show='headings', style='App.Treeview')
        for col, width in (('Rank', 70), ('Seat No', 120), ('Name', 210), ('SGPA', 90)):
            self.student_tree.heading(col, text=col)
            self.student_tree.column(col, width=width, anchor='center' if col != 'Name' else 'w')
        self.student_tree.grid(row=2, column=0, sticky='nsew', padx=18, pady=(0, 18))
        self.student_tree.bind('<Double-1>', lambda e: self.load_selected_student())

    def _bind_keys(self):
        self.root.bind('<Control-s>', lambda e: self.add_subject())
        self.root.bind('<Control-Return>', lambda e: self.calculate_result())
        self.root.bind('<Control-l>', lambda e: self.clear_form())
        self.root.bind('<F5>', lambda e: self.refresh_student_table())

    def _shade(self, color, factor):
        color = color.lstrip('#')
        rgb = [max(0, min(255, int(int(color[i:i + 2], 16) * factor))) for i in (0, 2, 4)]
        return f'#{rgb[0]:02x}{rgb[1]:02x}{rgb[2]:02x}'

    def _animate_cards(self):
        for index, card in enumerate(self.cards):
            self.root.after(120 * index, lambda ref=card: ref.config(highlightbackground=ref.accent, highlightthickness=1))
            self.root.after(360 + 120 * index, lambda ref=card: ref.config(highlightthickness=0))

    def _pulse_banner(self, ok=True):
        colors = ['#dcfce7', '#ecfdf5'] if ok else ['#fee2e2', '#fef2f2']
        fg = self.palette['teal'] if ok else self.palette['red']

        def step(i=0):
            if i >= len(colors):
                self.result_banner.config(bg=self.palette['soft'], fg=fg)
                return
            self.result_banner.config(bg=colors[i], fg=fg)
            self.root.after(120, lambda: step(i + 1))

        step()

    def _set_status(self, message):
        self.status_var.set(message)

    def _student_identity(self):
        name = self.name_entry.get().strip().title()
        roll = self.roll_entry.get().strip()
        if not name:
            raise ValueError('Student name is required.')
        if not roll:
            raise ValueError('Seat number is required.')
        return name, roll

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
        self.quick_status.config(text=f'{len(self.subjects)} subject(s) prepared')

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
            if not self.subjects:
                raise ValueError('Add at least one subject before calculating.')
            result_data, sgpa, weak_subjects, total_cp, is_fail = process_result(self.subjects)
            result_data = sorted(result_data, key=lambda row: row['code'])
            status = 'FAIL' if is_fail else 'PASS'
            save_state = save_student({'name': name, 'roll': roll, 'sgpa': sgpa})
            if 'error' in str(save_state):
                raise ValueError(save_state)
            rank = get_rank(roll) or '-'
            self.current_result = result_data
            self.current_summary = {'name': name, 'roll': roll, 'sgpa': sgpa, 'rank': rank, 'status': status, 'total_cp': total_cp}
            self._populate_result_tree(result_data, weak_subjects)
            self.sgpa_card.value_label.config(text=f'{sgpa:.2f}', fg=self.palette['navy'])
            self.rank_card.value_label.config(text=str(rank))
            self.status_card.value_label.config(text=status, fg=self.palette['teal'] if status == 'PASS' else self.palette['red'])
            self.cp_card.value_label.config(text=str(total_cp))
            total_credits = sum(row['credit'] for row in result_data)
            self.summary_label.config(text=f'Subjects: {len(result_data)} | Total Credits: {total_credits} | Weak Subjects: {len(weak_subjects)}')
            self.result_banner.config(text=f'{name} ({roll}) achieved {status} with SGPA {sgpa:.2f}')
            self.quick_status.config(text='Latest result saved successfully')
            self._pulse_banner(not is_fail)
            self.refresh_student_table()
            self._set_status(f'Result calculated and {save_state} for seat number {roll}.')
        except Exception as error:
            messagebox.showerror('Calculation Error', str(error))
            self._set_status('Calculation failed. Review the entered data and try again.')

    def _populate_result_tree(self, rows, weak_subjects):
        for item in self.result_tree.get_children():
            self.result_tree.delete(item)
        for row in rows:
            remark = 'Needs attention' if row['code'] in weak_subjects else 'On track'
            tag = 'weak' if row['code'] in weak_subjects else 'strong'
            self.result_tree.insert('', tk.END, values=(row['code'], row['marks'], row['credit'], row['grade'], row['gp'], row['cp'], remark), tags=(tag,))

    def refresh_student_table(self):
        for item in self.student_tree.get_children():
            self.student_tree.delete(item)
        search = self.filter_var.get().strip().lower()
        ranked = sorted(load_data(), key=lambda row: float(row.get('sgpa', 0)), reverse=True)
        self.student_rows = []
        current_rank = 1
        previous_sgpa = None
        for index, student in enumerate(ranked):
            sgpa = float(student.get('sgpa', 0))
            if previous_sgpa is not None and sgpa < previous_sgpa:
                current_rank = index + 1
            row = {'rank': current_rank, 'roll': str(student.get('roll', '')).strip(), 'name': str(student.get('name', '')).strip(), 'sgpa': sgpa}
            previous_sgpa = sgpa
            haystack = f"{row['roll']} {row['name']} {row['sgpa']:.2f}".lower()
            if search and search not in haystack:
                continue
            item_id = self.student_tree.insert('', tk.END, values=(row['rank'], row['roll'], row['name'], f"{row['sgpa']:.2f}"))
            self.student_rows.append((item_id, row))
        self._set_status(f'{len(self.student_rows)} student record(s) available.')

    def _selected_student(self):
        selection = self.student_tree.selection()
        if not selection:
            return None
        selected_id = selection[0]
        for item_id, row in self.student_rows:
            if item_id == selected_id:
                return row
        return None

    def load_selected_student(self):
        student = self._selected_student()
        if not student:
            messagebox.showinfo('Load Student', 'Select a student record first.')
            return
        self.name_entry.delete(0, tk.END)
        self.name_entry.insert(0, student['name'])
        self.roll_entry.delete(0, tk.END)
        self.roll_entry.insert(0, student['roll'])
        self._set_status(f"Loaded {student['name']} into the form.")

    def show_topper(self):
        topper = get_topper()
        if not topper:
            messagebox.showwarning('No Data', 'No student records found yet.')
            return
        topper_rank = get_rank(topper['roll']) or 1
        messagebox.showinfo('Top Performer', f"Name   : {topper['name']}\nSeat No: {topper['roll']}\nSGPA   : {float(topper['sgpa']):.2f}\nRank   : {topper_rank}")
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
        if not self.current_summary or not self.current_result:
            messagebox.showinfo('Export Report', 'Calculate a student result before exporting a report.')
            return
        default_file = Path(__file__).resolve().parent / 'reports' / f"{self.current_summary['roll']}_report.txt"
        target_path = filedialog.asksaveasfilename(title='Save Student Report', defaultextension='.txt', initialfile=default_file.name, initialdir=str(default_file.parent), filetypes=[('Text Files', '*.txt')])
        if not target_path:
            return
        generated = export_student_report(self.current_summary['name'], self.current_summary['roll'], self.current_result, self.current_summary['sgpa'], self.current_summary['rank'], self.current_summary['status'], self.current_summary['total_cp'])
        Path(target_path).write_text(generated.read_text(encoding='utf-8'), encoding='utf-8')
        messagebox.showinfo('Export Report', f'Report saved to:\n{target_path}')
        self._set_status(f"Report exported for {self.current_summary['roll']}.")

    def clear_form(self):
        for entry in (self.name_entry, self.roll_entry, self.subject_entry, self.marks_entry, self.credit_entry):
            entry.delete(0, tk.END)
        self.subjects.clear()
        self.current_result = []
        self.current_summary = None
        self.refresh_subject_list()
        self._update_progress()
        self._populate_result_tree([], [])
        self.sgpa_card.value_label.config(text='--', fg=self.palette['navy'])
        self.rank_card.value_label.config(text='--')
        self.status_card.value_label.config(text='Pending', fg=self.palette['amber'])
        self.cp_card.value_label.config(text='0')
        self.summary_label.config(text='Subjects: 0 | Total Credits: 0 | Weak Subjects: 0')
        self.result_banner.config(text='Result status will appear here after calculation.', bg=self.palette['soft'], fg=self.palette['navy'])
        self.quick_status.config(text='No calculation yet')
        self._set_status('Form cleared and ready for a new entry.')


def main():
    root = tk.Tk()
    PerformanceApp(root)
    root.mainloop()


if __name__ == '__main__':
    main()
