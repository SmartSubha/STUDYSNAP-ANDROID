package com.example.studysnap.data

import com.example.studysnap.model.*
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow

class StudySnapRepository {

    private val _userProfile = MutableStateFlow(
        UserProfile(
            uid = "user_smartsubha",
            name = "Subhajit Sanpui",
            email = "sanpuianup88@gmail.com",
            classNum = 12,
            school = "Calcutta Medical College & National High School",
            phone = "9876543210",
            points = 1280,
            streak = 15,
            isVIP = true,
            role = "admin"
        )
    )
    val userProfile: StateFlow<UserProfile> = _userProfile.asStateFlow()

    private val _notes = MutableStateFlow(
        listOf(
            Note(
                id = "note_1",
                title = "Human Circulatory System & Cardiac Cycle",
                subject = "Biology",
                type = NoteType.TEXT,
                content = """
# Human Circulatory System & Cardiac Cycle
Authored by Subhajit Sanpui (Future Cardiac Surgeon)

## 1. Anatomy of the Human Heart
The human heart is a muscular organ about the size of a fist, located just behind and slightly left of the breastbone. It has 4 chambers:
- **Right Atrium**: Receives deoxygenated blood from the superior and inferior vena cava.
- **Right Ventricle**: Pumps deoxygenated blood through the pulmonary valve to the lungs.
- **Left Atrium**: Receives oxygenated blood from pulmonary veins.
- **Left Ventricle**: Pumps oxygenated blood through aortic valve to systemic circulation (thickest myocardium).

## 2. Phases of the Cardiac Cycle (Duration: 0.8 sec)
1. **Atrial Systole (0.1s)**: Atria contract, pushing remaining 30% of blood into ventricles.
2. **Ventricular Systole (0.3s)**: 
   - *Isovolumetric contraction*: All valves closed, pressure rises rapidly.
   - *Ventricular ejection*: Semilunar valves open, blood pumped into aorta and pulmonary trunk.
3. **Joint Diastole (0.4s)**: All four chambers relax, AV valves open, passive filling occurs.

## 3. Electrocardiogram (ECG) Deflections
- **P Wave**: Atrial depolarization.
- **QRS Complex**: Ventricular depolarization (atrial repolarization masked).
- **T Wave**: Ventricular repolarization.
                """.trimIndent(),
                authorName = "Subhajit Sanpui",
                aiSummary = "Detailed anatomical and physiological breakdown of cardiac cycle phases and ECG correlation.",
                estimatedReadTime = "6 min",
                isBookmarked = true,
                isRead = true
            ),
            Note(
                id = "note_2",
                title = "Electromagnetic Induction & Faraday's Laws",
                subject = "Physics",
                type = NoteType.TEXT,
                content = """
# Electromagnetic Induction & Faraday's Laws

## 1. Magnetic Flux ($\Phi$)
The total magnetic flux passing through a surface area $A$ in a uniform magnetic field $B$:
$$\Phi = B \cdot A = B A \cos(\theta)$$
Unit: Weber (Wb) or Tesla meter squared ($T \cdot m^2$).

## 2. Faraday's Laws
- **First Law**: Whenever magnetic flux linked with a circuit changes, an electromotive force (EMF) is induced.
- **Second Law**: The magnitude of the induced EMF is directly proportional to the rate of change of magnetic flux:
$$\mathcal{E} = -N \frac{d\Phi}{dt}$$

## 3. Lenz's Law
The polarity of induced EMF is such that it produces a current whose magnetic field opposes the change that created it (Consequence of Conservation of Energy).
                """.trimIndent(),
                authorName = "SmartSubha Academics",
                aiSummary = "Key formulas, definitions of magnetic flux, Faraday's first and second laws, and Lenz's law.",
                estimatedReadTime = "4 min",
                isBookmarked = false,
                isRead = false
            ),
            Note(
                id = "note_3",
                title = "Organic Reaction Mechanisms: SN1 vs SN2",
                subject = "Chemistry",
                type = NoteType.TEXT,
                content = """
# Nucleophilic Substitution: SN1 vs SN2

## Comparison Table
| Feature | SN1 Mechanism | SN2 Mechanism |
| :--- | :--- | :--- |
| **Kinetics** | First order: Rate = k[R-X] | Second order: Rate = k[R-X][Nu-] |
| **Steps** | 2 Steps (Carbocation intermediate) | 1 Step (Concerted transition state) |
| **Substrate Reactivity** | $3^\circ > 2^\circ > 1^\circ > \text{CH}_3$ | $\text{CH}_3 > 1^\circ > 2^\circ > 3^\circ$ |
| **Stereochemistry** | Racemization (partial inversion) | Complete Walden Inversion |
| **Solvent** | Polar Protic ($H_2O, EtOH$) | Polar Aprotic ($DMSO, Acetone$) |
| **Nucleophile** | Weak or moderate | Strong nucleophile required |
                """.trimIndent(),
                authorName = "Dr. Subha Chemistry Team",
                aiSummary = "Direct comparison table covering kinetics, stereochemistry, solvent effects, and substrate orders for SN1 and SN2.",
                estimatedReadTime = "5 min",
                isBookmarked = true,
                isRead = false
            ),
            Note(
                id = "note_4",
                title = "Calculus: Definite Integrals & Properties",
                subject = "Mathematics",
                type = NoteType.PDF,
                content = """
# Definite Integrals: Core Properties & Shortcuts

## Standard King's Property
$$\int_a^b f(x) dx = \int_a^b f(a + b - x) dx$$

## Periodic Functions
If $f(x + T) = f(x)$:
$$\int_0^{nT} f(x) dx = n \int_0^T f(x) dx$$

## Odd and Even Functions
- If $f(-x) = f(x)$ (Even): $\int_{-a}^a f(x) dx = 2 \int_0^a f(x) dx$
- If $f(-x) = -f(x)$ (Odd): $\int_{-a}^a f(x) dx = 0$
                """.trimIndent(),
                pdfUrl = "https://studysnap.internal/calculus_mastery.pdf",
                authorName = "Subhajit Math Vault",
                aiSummary = "Comprehensive formula sheet on definite integration properties and periodic evaluation tricks.",
                estimatedReadTime = "7 min",
                isBookmarked = false,
                isRead = false
            ),
            Note(
                id = "note_5",
                title = "Data Structures: Binary Search Trees & AVL",
                subject = "Computer Science",
                type = NoteType.TEXT,
                content = """
# Binary Search Trees (BST) & Self-Balancing AVL Trees

## 1. BST Property
For every node $X$, all values in the left subtree are smaller than $X$, and all values in the right subtree are larger.
- Search Average: $O(\log n)$
- Worst Case (Skewed): $O(n)$

## 2. AVL Trees
An AVL tree maintains height balance where for every node:
$$\text{Balance Factor} = |\text{Height}(Left) - \text{Height}(Right)| \le 1$$

Rotations to restore balance:
- LL Rotation (Single Right)
- RR Rotation (Single Left)
- LR Rotation (Left-Right double)
- RL Rotation (Right-Left double)
                """.trimIndent(),
                authorName = "SmartSubha Tech",
                aiSummary = "In-depth guide on BST search complexities, AVL balance factors, and 4 rotation techniques.",
                estimatedReadTime = "5 min",
                isBookmarked = false,
                isRead = true
            ),
            Note(
                id = "note_6",
                title = "Critical Essay Writing & Literature Analysis",
                subject = "English",
                type = NoteType.TEXT,
                content = """
# Academic Essay Writing: Structure & Rhetorical Devices

## Standard 5-Paragraph Essay Framework
1. **Introduction**: Engaging hook, contextual background, and clear thesis statement.
2. **Body Paragraph 1**: Strongest argument with direct textual evidence and analysis.
3. **Body Paragraph 2**: Secondary supportive point with counter-argument refutation.
4. **Body Paragraph 3**: Nuanced perspective showing broader implications.
5. **Conclusion**: Restate thesis in fresh words, synthesize main points, closing thought.
                """.trimIndent(),
                authorName = "Humanities Wing",
                aiSummary = "Step-by-step formula for writing high-scoring academic essays and textual analysis.",
                estimatedReadTime = "4 min",
                isBookmarked = false,
                isRead = false
            )
        )
    )
    val notes: StateFlow<List<Note>> = _notes.asStateFlow()

    private val _quizzes = MutableStateFlow(
        listOf(
            Quiz(
                id = "quiz_1",
                question = "Which phase of the cardiac cycle lasts approximately 0.1 seconds in a healthy resting adult?",
                options = listOf(
                    "Ventricular Systole",
                    "Atrial Systole",
                    "Joint Diastole",
                    "Isovolumetric Relaxation"
                ),
                correctAnswer = 1,
                subject = "Biology",
                points = 20,
                explanation = "Atrial systole lasts about 0.1 seconds, during which atria contract to push blood into the ventricles."
            ),
            Quiz(
                id = "quiz_2",
                question = "According to Lenz's Law, what does the induced current always oppose?",
                options = listOf(
                    "The resistance of the conductor",
                    "The electrostatic potential",
                    "The change in magnetic flux that caused it",
                    "The velocity of light"
                ),
                correctAnswer = 2,
                subject = "Physics",
                points = 20,
                explanation = "Lenz's Law states that the induced current opposes the change in magnetic flux producing it."
            ),
            Quiz(
                id = "quiz_3",
                question = "Which substrate type undergoes SN2 nucleophilic substitution at the fastest rate?",
                options = listOf(
                    "Tertiary alkyl halide",
                    "Secondary alkyl halide",
                    "Methyl halide",
                    "Neopentyl halide"
                ),
                correctAnswer = 2,
                subject = "Chemistry",
                points = 20,
                explanation = "Methyl halide experiences the least steric hindrance, allowing backside attack in SN2."
            ),
            Quiz(
                id = "quiz_4",
                question = "What is the value of the definite integral of an odd function from -a to a?",
                options = listOf(
                    "2a",
                    "0",
                    "a squared",
                    "Undefined"
                ),
                correctAnswer = 1,
                subject = "Mathematics",
                points = 20,
                explanation = "For any continuous odd function f(-x) = -f(x), the integral from -a to a is identically 0."
            ),
            Quiz(
                id = "quiz_5",
                question = "What is the worst-case time complexity of searching in an unbalanced Binary Search Tree?",
                options = listOf(
                    "O(1)",
                    "O(log N)",
                    "O(N)",
                    "O(N log N)"
                ),
                correctAnswer = 2,
                subject = "Computer Science",
                points = 20,
                explanation = "If elements are inserted in sorted order, the BST degenerates into a linked list, taking O(N) time."
            )
        )
    )
    val quizzes: StateFlow<List<Quiz>> = _quizzes.asStateFlow()

    private val _leaderboard = MutableStateFlow(
        listOf(
            LeaderboardEntry("u1", "Subhajit Sanpui", 1450, true, 1, "Calcutta Medical College"),
            LeaderboardEntry("u2", "Ananya Sharma", 1380, true, 2, "St. Xavier's Collegiate"),
            LeaderboardEntry("u3", "Rohan Banerjee", 1290, false, 3, "South Point High School"),
            LeaderboardEntry("u4", "Sneha Roy", 1150, true, 4, "Delhi Public School"),
            LeaderboardEntry("u5", "Arpan Mukherjee", 1020, false, 5, "Don Bosco Liluah"),
            LeaderboardEntry("u6", "Priya Das", 980, false, 6, "Modern High School"),
            LeaderboardEntry("u7", "Debanjan Paul", 890, false, 7, "Heritage Academy")
        )
    )
    val leaderboard: StateFlow<List<LeaderboardEntry>> = _leaderboard.asStateFlow()

    private val _notices = MutableStateFlow(
        listOf(
            Notice(
                id = "not_1",
                subject = "Pre-Board Examination Schedule Released",
                fromDate = "2026-11-01",
                toDate = "2026-11-15",
                priority = "high",
                content = "All Class 12 students must check the official timetable. Admit cards can be downloaded from the student portal starting Monday."
            ),
            Notice(
                id = "not_2",
                subject = "AI Doubt Solver 2.0 Live",
                fromDate = "2026-10-25",
                toDate = "2026-12-31",
                priority = "medium",
                content = "StudySnap AI Doubt Solver now provides step-by-step derivations for Physics, Chemistry, and Biology. Try it in the Doubts tab!"
            ),
            Notice(
                id = "not_3",
                subject = "Weekly Quiz Competition & VIP Badges",
                fromDate = "2026-10-20",
                toDate = "2026-11-30",
                priority = "low",
                content = "Top 3 students on the weekly leaderboard will receive the VIP Student badge and 200 bonus streak points."
            )
        )
    )
    val notices: StateFlow<List<Notice>> = _notices.asStateFlow()

    private val _questions = MutableStateFlow(
        listOf(
            Question(
                id = "q_1",
                userId = "u1",
                userName = "Subhajit Sanpui",
                text = "What is the difference between isometric and isotonic cardiac contraction?",
                answer = "In isometric contraction, the muscle tension increases without changing fiber length. In isotonic contraction, the muscle shortens against a constant load (e.g. during ventricular ejection).",
                createdAt = "2 hours ago",
                status = "answered"
            ),
            Question(
                id = "q_2",
                userId = "u2",
                userName = "Ananya Sharma",
                text = "How does eddy current damping work in galvanometers?",
                answer = "When the metal frame oscillates in the magnetic field, eddy currents are induced in it which produce opposing torque as per Lenz's Law, damping the oscillations rapidly.",
                createdAt = "Yesterday",
                status = "answered"
            )
        )
    )
    val questions: StateFlow<List<Question>> = _questions.asStateFlow()

    private val _calendarEvents = MutableStateFlow(
        listOf(
            CalendarEvent("e1", "Biology Pre-Board Exam", "2026-11-04", "exam", "Cardiovascular, Neural & Genetics chapters"),
            CalendarEvent("e2", "Physics Mock Test", "2026-11-07", "exam", "Electromagnetism, Optics, Modern Physics"),
            CalendarEvent("e3", "Winter Break", "2026-12-24", "holiday", "National winter holiday break"),
            CalendarEvent("e4", "Chemistry Doubt Clearing Session", "2026-11-10", "class", "Live webinar with SmartSubha")
        )
    )
    val calendarEvents: StateFlow<List<CalendarEvent>> = _calendarEvents.asStateFlow()

    private val _lofiTracks = MutableStateFlow(
        listOf(
            LofiTrack("track_1", "Midnight Focus Study", "Lofi Chills", "3:45"),
            LofiTrack("track_2", "Rainy Day Concentration", "Ambient Soundscape", "4:12"),
            LofiTrack("track_3", "Serene Sunset Rhythm", "Subhajit Beats", "2:58"),
            LofiTrack("track_4", "Deep Work Alpha Waves", "Brain Wave Labs", "5:20")
        )
    )
    val lofiTracks: StateFlow<List<LofiTrack>> = _lofiTracks.asStateFlow()

    // --- Actions ---

    fun toggleBookmark(noteId: String) {
        _notes.value = _notes.value.map {
            if (it.id == noteId) it.copy(isBookmarked = !it.isBookmarked) else it
        }
    }

    fun markNoteAsRead(noteId: String) {
        val note = _notes.value.find { it.id == noteId }
        if (note != null && !note.isRead) {
            _notes.value = _notes.value.map {
                if (it.id == noteId) it.copy(isRead = true) else it
            }
            addPoints(10)
        }
    }

    fun addPoints(amount: Int) {
        val current = _userProfile.value
        _userProfile.value = current.copy(points = current.points + amount)
    }

    fun answerQuiz(quizId: String, selectedOption: Int): Boolean {
        val quiz = _quizzes.value.find { it.id == quizId } ?: return false
        val isCorrect = (quiz.correctAnswer == selectedOption)
        if (isCorrect) {
            addPoints(quiz.points)
        }
        return isCorrect
    }

    fun submitDoubt(text: String, userName: String): Question {
        // AI Solution synthesis based on subject keywords
        val generatedAnswer = synthesizeAIAnswer(text)
        val newQuestion = Question(
            id = "q_${System.currentTimeMillis()}",
            userId = _userProfile.value.uid,
            userName = userName.ifBlank { _userProfile.value.name },
            text = text,
            answer = generatedAnswer,
            createdAt = "Just now",
            status = "answered"
        )
        _questions.value = listOf(newQuestion) + _questions.value
        addPoints(5)
        return newQuestion
    }

    private fun synthesizeAIAnswer(query: String): String {
        val lower = query.lowercase()
        return when {
            "heart" in lower || "cardiac" in lower || "blood" in lower || "valve" in lower ->
                "💡 **StudySnap AI Solution (Cardiology/Biology):**\n" +
                "The heart functions as a dual muscular pump. During ventricular systole, pressure increases exceeding aortic and pulmonary artery pressure, forcing the semilunar valves to open and ejecting stroke volume (~70 mL). The AV valves (tricuspid & bicuspid) remain tightly closed to prevent regurgitation."
            "faraday" in lower || "flux" in lower || "induction" in lower || "lenz" in lower ->
                "💡 **StudySnap AI Solution (Physics):**\n" +
                "Induced EMF $\\mathcal{E} = -N \\frac{d\\Phi_B}{dt}$. The negative sign indicates Lenz's Law: the induced magnetic field opposes the change in original magnetic flux. This ensures the conservation of energy."
            "sn1" in lower || "sn2" in lower || "organic" in lower || "reaction" in lower ->
                "💡 **StudySnap AI Solution (Chemistry):**\n" +
                "SN1 proceeds through a planar carbocation intermediate in polar protic solvents, leading to racemization. In contrast, SN2 is a single-step concerted mechanism with backside nucleophilic attack, requiring a polar aprotic solvent and causing complete inversion of configuration."
            "integral" in lower || "calculus" in lower || "derivative" in lower || "math" in lower ->
                "💡 **StudySnap AI Solution (Mathematics):**\n" +
                "To evaluate this integral, check if King's Property $\\int_a^b f(x)dx = \\int_a^b f(a+b-x)dx$ applies. If $f(a+b-x) + f(x) = C$, the integral simplifies directly to $\\frac{C(b-a)}{2}$."
            else ->
                "💡 **StudySnap AI Solution:**\n" +
                "Based on the core NCERT / standard syllabus guidelines for your question, the key principle involves identifying the governing physical or mathematical rule, verifying the boundary conditions, and applying the standard formula step-by-step."
        }
    }

    fun addNote(title: String, subject: String, type: NoteType, content: String, authorName: String) {
        val newNote = Note(
            id = "note_${System.currentTimeMillis()}",
            title = title,
            subject = subject,
            type = type,
            content = content,
            authorName = authorName.ifBlank { _userProfile.value.name },
            createdAt = "Just now",
            aiSummary = content.take(120) + "...",
            isBookmarked = false,
            isRead = false
        )
        _notes.value = listOf(newNote) + _notes.value
        addPoints(25)
    }

    fun addNotice(subject: String, priority: String, content: String) {
        val newNotice = Notice(
            id = "not_${System.currentTimeMillis()}",
            subject = subject,
            fromDate = "Today",
            toDate = "Upcoming",
            priority = priority.lowercase(),
            content = content
        )
        _notices.value = listOf(newNotice) + _notices.value
    }

    fun addQuiz(question: String, options: List<String>, correctAnswer: Int, subject: String, explanation: String) {
        val newQuiz = Quiz(
            id = "quiz_${System.currentTimeMillis()}",
            question = question,
            options = options,
            correctAnswer = correctAnswer,
            subject = subject,
            points = 20,
            explanation = explanation
        )
        _quizzes.value = _quizzes.value + newQuiz
    }

    fun updateProfile(name: String, school: String, phone: String, classNum: Int) {
        _userProfile.value = _userProfile.value.copy(
            name = name,
            school = school,
            phone = phone,
            classNum = classNum
        )
    }

    fun toggleVIP() {
        val current = _userProfile.value
        _userProfile.value = current.copy(isVIP = !current.isVIP)
    }
}
