package com.example.studysnap.ui.screens

import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.studysnap.model.NoteType
import com.example.studysnap.ui.components.NoteCard
import com.example.studysnap.ui.components.SubjectFilterChips
import com.example.studysnap.ui.theme.BluePrimary
import com.example.studysnap.ui.viewmodel.StudySnapViewModel

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun NotesScreen(
    viewModel: StudySnapViewModel,
    modifier: Modifier = Modifier
) {
    val notes by viewModel.filteredNotes.collectAsState()
    val selectedSubject by viewModel.selectedSubject.collectAsState()
    val searchQuery by viewModel.searchQuery.collectAsState()
    val userProfile by viewModel.userProfile.collectAsState()

    var showAddNoteDialog by remember { mutableStateOf(false) }

    Scaffold(
        modifier = modifier.fillMaxSize().testTag("notes_screen"),
        floatingActionButton = {
            FloatingActionButton(
                onClick = { showAddNoteDialog = true },
                containerColor = BluePrimary,
                contentColor = androidx.compose.ui.graphics.Color.White,
                shape = RoundedCornerShape(16.dp),
                modifier = Modifier
                    .padding(bottom = 70.dp)
                    .testTag("add_note_fab")
            ) {
                Icon(Icons.Default.Add, contentDescription = "Add Note")
            }
        }
    ) { padding ->
        LazyColumn(
            modifier = Modifier
                .fillMaxSize()
                .padding(padding),
            contentPadding = PaddingValues(16.dp),
            verticalArrangement = Arrangement.spacedBy(14.dp)
        ) {
            item {
                Text(
                    text = "Study Notes Vault",
                    style = MaterialTheme.typography.headlineMedium,
                    fontWeight = FontWeight.Black
                )
                Text(
                    text = "Curated syllabus notes, derivations, and summaries",
                    style = MaterialTheme.typography.bodyMedium,
                    color = MaterialTheme.colorScheme.onSurfaceVariant
                )
            }

            // Search Bar
            item {
                OutlinedTextField(
                    value = searchQuery,
                    onValueChange = { viewModel.updateSearchQuery(it) },
                    modifier = Modifier
                        .fillMaxWidth()
                        .testTag("notes_search_input"),
                    placeholder = { Text("Search notes, topics, formulas...") },
                    leadingIcon = {
                        Icon(Icons.Default.Search, contentDescription = "Search", tint = BluePrimary)
                    },
                    trailingIcon = {
                        if (searchQuery.isNotEmpty()) {
                            IconButton(onClick = { viewModel.updateSearchQuery("") }) {
                                Icon(Icons.Default.Close, contentDescription = "Clear")
                            }
                        }
                    },
                    singleLine = true,
                    shape = RoundedCornerShape(16.dp)
                )
            }

            // Subject Filter
            item {
                SubjectFilterChips(
                    subjects = viewModel.subjects,
                    selectedSubject = selectedSubject,
                    onSelectSubject = { viewModel.selectSubject(it) }
                )
            }

            if (notes.isEmpty()) {
                item {
                    Box(
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(vertical = 40.dp),
                        contentAlignment = Alignment.Center
                    ) {
                        Column(horizontalAlignment = Alignment.CenterHorizontally) {
                            Icon(
                                Icons.Default.SearchOff,
                                contentDescription = "No Notes",
                                tint = MaterialTheme.colorScheme.onSurfaceVariant,
                                modifier = Modifier.size(48.dp)
                            )
                            Spacer(modifier = Modifier.height(8.dp))
                            Text(
                                text = "No notes found for \"$searchQuery\"",
                                style = MaterialTheme.typography.bodyLarge,
                                color = MaterialTheme.colorScheme.onSurfaceVariant
                            )
                        }
                    }
                }
            } else {
                items(notes) { note ->
                    NoteCard(
                        note = note,
                        onOpen = { viewModel.openNote(note) },
                        onToggleBookmark = { viewModel.toggleBookmark(note.id) }
                    )
                }
            }
        }
    }

    if (showAddNoteDialog) {
        AddNoteDialog(
            authorName = userProfile.name,
            onDismiss = { showAddNoteDialog = false },
            onAdd = { title, subject, type, content ->
                viewModel.addNote(title, subject, type, content, userProfile.name)
                showAddNoteDialog = false
            }
        )
    }
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun AddNoteDialog(
    authorName: String,
    onDismiss: () -> Unit,
    onAdd: (title: String, subject: String, type: NoteType, content: String) -> Unit
) {
    var title by remember { mutableStateOf("") }
    var selectedSubject by remember { mutableStateOf("Physics") }
    var selectedType by remember { mutableStateOf(NoteType.TEXT) }
    var content by remember { mutableStateOf("") }

    val subjects = listOf("Physics", "Chemistry", "Biology", "Mathematics", "Computer Science", "English")

    AlertDialog(
        onDismissRequest = onDismiss,
        title = {
            Text("Create Study Note", fontWeight = FontWeight.Black)
        },
        text = {
            Column(
                modifier = Modifier.fillMaxWidth(),
                verticalArrangement = Arrangement.spacedBy(10.dp)
            ) {
                OutlinedTextField(
                    value = title,
                    onValueChange = { title = it },
                    label = { Text("Note Title") },
                    modifier = Modifier.fillMaxWidth(),
                    shape = RoundedCornerShape(12.dp)
                )

                Text("Subject:", style = MaterialTheme.typography.labelSmall)
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.spacedBy(6.dp)
                ) {
                    subjects.take(3).forEach { subj ->
                        FilterChip(
                            selected = selectedSubject == subj,
                            onClick = { selectedSubject = subj },
                            label = { Text(subj, fontSize = 11.sp) }
                        )
                    }
                }
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.spacedBy(6.dp)
                ) {
                    subjects.drop(3).forEach { subj ->
                        FilterChip(
                            selected = selectedSubject == subj,
                            onClick = { selectedSubject = subj },
                            label = { Text(subj, fontSize = 11.sp) }
                        )
                    }
                }

                OutlinedTextField(
                    value = content,
                    onValueChange = { content = it },
                    label = { Text("Content / Notes") },
                    modifier = Modifier
                        .fillMaxWidth()
                        .height(140.dp),
                    shape = RoundedCornerShape(12.dp)
                )
            }
        },
        confirmButton = {
            Button(
                onClick = {
                    if (title.isNotBlank()) {
                        onAdd(title, selectedSubject, selectedType, content)
                    }
                },
                enabled = title.isNotBlank()
            ) {
                Text("Publish Note (+25 Pts)")
            }
        },
        dismissButton = {
            TextButton(onClick = onDismiss) {
                Text("Cancel")
            }
        }
    )
}
