package com.example.studysnap.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.studysnap.ui.theme.*
import com.example.studysnap.ui.viewmodel.StudySnapViewModel

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun ProfileSettingsScreen(
    viewModel: StudySnapViewModel,
    modifier: Modifier = Modifier
) {
    val userProfile by viewModel.userProfile.collectAsState()

    var showEditProfileDialog by remember { mutableStateOf(false) }
    var showAddNoticeDialog by remember { mutableStateOf(false) }
    var showAddQuizDialog by remember { mutableStateOf(false) }

    LazyColumn(
        modifier = modifier
            .fillMaxSize()
            .testTag("profile_settings_screen"),
        contentPadding = PaddingValues(16.dp),
        verticalArrangement = Arrangement.spacedBy(16.dp)
    ) {
        item {
            Text(
                text = "Profile & Settings",
                style = MaterialTheme.typography.headlineMedium,
                fontWeight = FontWeight.Black
            )
            Text(
                text = "Manage your student identity, VIP benefits, and app preferences",
                style = MaterialTheme.typography.bodyMedium,
                color = MaterialTheme.colorScheme.onSurfaceVariant
            )
        }

        // Profile Identity Card
        item {
            Card(
                modifier = Modifier
                    .fillMaxWidth()
                    .testTag("profile_card"),
                shape = RoundedCornerShape(24.dp),
                colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface),
                elevation = CardDefaults.cardElevation(defaultElevation = 2.dp)
            ) {
                Column(modifier = Modifier.padding(20.dp)) {
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Box(
                            modifier = Modifier
                                .size(64.dp)
                                .clip(CircleShape)
                                .background(
                                    Brush.linearGradient(listOf(BluePrimary, Color(0xFF1E3A8A)))
                                ),
                            contentAlignment = Alignment.Center
                        ) {
                            Text(
                                text = userProfile.name.take(2).uppercase(),
                                color = Color.White,
                                fontSize = 24.sp,
                                fontWeight = FontWeight.Black
                            )
                        }

                        Spacer(modifier = Modifier.width(16.dp))

                        Column(modifier = Modifier.weight(1f)) {
                            Row(verticalAlignment = Alignment.CenterVertically) {
                                Text(
                                    text = userProfile.name,
                                    style = MaterialTheme.typography.titleLarge,
                                    fontWeight = FontWeight.Black
                                )
                                if (userProfile.isVIP) {
                                    Spacer(modifier = Modifier.width(6.dp))
                                    Surface(
                                        shape = RoundedCornerShape(6.dp),
                                        color = AmberWarning
                                    ) {
                                        Text(
                                            text = "VIP",
                                            color = Navy900,
                                            fontSize = 9.sp,
                                            fontWeight = FontWeight.Black,
                                            modifier = Modifier.padding(horizontal = 4.dp, vertical = 2.dp)
                                        )
                                    }
                                }
                            }
                            Text(
                                text = userProfile.school,
                                fontSize = 12.sp,
                                color = MaterialTheme.colorScheme.onSurfaceVariant
                            )
                            Text(
                                text = "Class ${userProfile.classNum} • Role: ${userProfile.role.uppercase()}",
                                fontSize = 11.sp,
                                fontWeight = FontWeight.Bold,
                                color = BluePrimary
                            )
                        }

                        IconButton(onClick = { showEditProfileDialog = true }) {
                            Icon(Icons.Default.Edit, contentDescription = "Edit Profile")
                        }
                    }

                    HorizontalDivider(modifier = Modifier.padding(vertical = 16.dp))

                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceAround
                    ) {
                        ProfileStatItem(title = "Points", value = "${userProfile.points}")
                        ProfileStatItem(title = "Streak", value = "${userProfile.streak} Days")
                        ProfileStatItem(title = "Rank", value = "#1")
                    }
                }
            }
        }

        // VIP Membership Perks Card
        item {
            Card(
                modifier = Modifier
                    .fillMaxWidth()
                    .testTag("vip_membership_card"),
                shape = RoundedCornerShape(24.dp),
                elevation = CardDefaults.cardElevation(defaultElevation = 2.dp)
            ) {
                Box(
                    modifier = Modifier
                        .fillMaxWidth()
                        .background(
                            Brush.linearGradient(
                                listOf(Color(0xFFF59E0B), Color(0xFFD97706), Color(0xFF78350F))
                            )
                        )
                        .padding(20.dp)
                ) {
                    Column {
                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.SpaceBetween,
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Row(verticalAlignment = Alignment.CenterVertically) {
                                Icon(
                                    Icons.Default.WorkspacePremium,
                                    contentDescription = null,
                                    tint = Color.White,
                                    modifier = Modifier.size(24.dp)
                                )
                                Spacer(modifier = Modifier.width(8.dp))
                                Text(
                                    text = "STUDYSNAP VIP PASS",
                                    color = Color.White,
                                    fontSize = 14.sp,
                                    fontWeight = FontWeight.Black,
                                    fontFamily = FontFamily.Monospace
                                )
                            }
                            Switch(
                                checked = userProfile.isVIP,
                                onCheckedChange = { viewModel.toggleVIP() },
                                colors = SwitchDefaults.colors(
                                    checkedThumbColor = Color.White,
                                    checkedTrackColor = Color(0xFF1E3A8A)
                                )
                            )
                        }

                        Spacer(modifier = Modifier.height(10.dp))

                        Text(
                            text = if (userProfile.isVIP) "Active VIP Student Status" else "Unlock VIP Student Perks",
                            color = Color.White,
                            fontSize = 18.sp,
                            fontWeight = FontWeight.Black
                        )
                        Text(
                            text = "Enjoy 2x Quiz Streak Points, Gold Leaderboard Badge, and Offline Notes.",
                            color = Color.White.copy(alpha = 0.9f),
                            fontSize = 12.sp
                        )
                    }
                }
            }
        }

        // Admin Management Tools (Available for Subha / Admin role)
        if (userProfile.role == "admin") {
            item {
                Text(
                    text = "ADMINISTRATOR TOOLS",
                    style = MaterialTheme.typography.labelSmall,
                    color = MaterialTheme.colorScheme.onSurfaceVariant,
                    modifier = Modifier.padding(top = 8.dp)
                )
            }

            item {
                Card(
                    modifier = Modifier.fillMaxWidth(),
                    shape = RoundedCornerShape(20.dp),
                    colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface)
                ) {
                    Column(modifier = Modifier.padding(16.dp)) {
                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.spacedBy(10.dp)
                        ) {
                            Button(
                                onClick = { showAddNoticeDialog = true },
                                shape = RoundedCornerShape(12.dp),
                                modifier = Modifier.weight(1f)
                            ) {
                                Icon(Icons.Default.Campaign, contentDescription = null, modifier = Modifier.size(16.dp))
                                Spacer(modifier = Modifier.width(4.dp))
                                Text("Add Notice", fontSize = 12.sp)
                            }
                            Button(
                                onClick = { showAddQuizDialog = true },
                                shape = RoundedCornerShape(12.dp),
                                modifier = Modifier.weight(1f)
                            ) {
                                Icon(Icons.Default.Quiz, contentDescription = null, modifier = Modifier.size(16.dp))
                                Spacer(modifier = Modifier.width(4.dp))
                                Text("Add Quiz", fontSize = 12.sp)
                            }
                        }
                    }
                }
            }
        }

        // About StudySnap & Developer Credits
        item {
            Card(
                modifier = Modifier.fillMaxWidth(),
                shape = RoundedCornerShape(20.dp),
                colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surfaceVariant.copy(alpha = 0.4f))
            ) {
                Column(modifier = Modifier.padding(16.dp)) {
                    Text(
                        text = "About StudySnap",
                        fontWeight = FontWeight.Black,
                        fontSize = 14.sp
                    )
                    Spacer(modifier = Modifier.height(4.dp))
                    Text(
                        text = "Founded by Subhajit Sanpui (SmartSubha) • Future Cardiac Surgeon & Developer. Dedicated to empowering students with smart note-taking, AI doubt resolution, and collaborative academic learning.",
                        style = MaterialTheme.typography.bodyMedium,
                        fontSize = 12.sp,
                        color = MaterialTheme.colorScheme.onSurfaceVariant,
                        lineHeight = 18.sp
                    )
                    Spacer(modifier = Modifier.height(8.dp))
                    Text(
                        text = "StudySnap Android Edition • v1.0.0",
                        fontSize = 10.sp,
                        fontFamily = FontFamily.Monospace,
                        color = BluePrimary,
                        fontWeight = FontWeight.Bold
                    )
                }
            }
        }
    }

    // Dialogs
    if (showEditProfileDialog) {
        EditProfileDialog(
            currentName = userProfile.name,
            currentSchool = userProfile.school,
            currentPhone = userProfile.phone,
            currentClass = userProfile.classNum,
            onDismiss = { showEditProfileDialog = false },
            onSave = { name, school, phone, classNum ->
                viewModel.updateProfile(name, school, phone, classNum)
                showEditProfileDialog = false
            }
        )
    }

    if (showAddNoticeDialog) {
        AddNoticeDialog(
            onDismiss = { showAddNoticeDialog = false },
            onAdd = { subject, priority, content ->
                viewModel.addNotice(subject, priority, content)
                showAddNoticeDialog = false
            }
        )
    }

    if (showAddQuizDialog) {
        AddQuizDialog(
            onDismiss = { showAddQuizDialog = false },
            onAdd = { q, opts, correct, subj, exp ->
                viewModel.addQuiz(q, opts, correct, subj, exp)
                showAddQuizDialog = false
            }
        )
    }
}

@Composable
fun ProfileStatItem(title: String, value: String) {
    Column(horizontalAlignment = Alignment.CenterHorizontally) {
        Text(
            text = value,
            fontSize = 18.sp,
            fontWeight = FontWeight.Black,
            color = BluePrimary
        )
        Text(
            text = title,
            fontSize = 11.sp,
            fontWeight = FontWeight.Medium,
            color = MaterialTheme.colorScheme.onSurfaceVariant
        )
    }
}

@Composable
fun EditProfileDialog(
    currentName: String,
    currentSchool: String,
    currentPhone: String,
    currentClass: Int,
    onDismiss: () -> Unit,
    onSave: (name: String, school: String, phone: String, classNum: Int) -> Unit
) {
    var name by remember { mutableStateOf(currentName) }
    var school by remember { mutableStateOf(currentSchool) }
    var phone by remember { mutableStateOf(currentPhone) }
    var classNum by remember { mutableStateOf(currentClass.toString()) }

    AlertDialog(
        onDismissRequest = onDismiss,
        title = { Text("Edit Student Profile", fontWeight = FontWeight.Black) },
        text = {
            Column(verticalArrangement = Arrangement.spacedBy(10.dp)) {
                OutlinedTextField(
                    value = name,
                    onValueChange = { name = it },
                    label = { Text("Full Name") },
                    shape = RoundedCornerShape(12.dp)
                )
                OutlinedTextField(
                    value = school,
                    onValueChange = { school = it },
                    label = { Text("School / College") },
                    shape = RoundedCornerShape(12.dp)
                )
                OutlinedTextField(
                    value = classNum,
                    onValueChange = { classNum = it },
                    label = { Text("Class (e.g. 12)") },
                    shape = RoundedCornerShape(12.dp)
                )
                OutlinedTextField(
                    value = phone,
                    onValueChange = { phone = it },
                    label = { Text("Phone Number") },
                    shape = RoundedCornerShape(12.dp)
                )
            }
        },
        confirmButton = {
            Button(
                onClick = {
                    onSave(name, school, phone, classNum.toIntOrNull() ?: currentClass)
                }
            ) {
                Text("Save")
            }
        },
        dismissButton = {
            TextButton(onClick = onDismiss) { Text("Cancel") }
        }
    )
}

@Composable
fun AddNoticeDialog(
    onDismiss: () -> Unit,
    onAdd: (subject: String, priority: String, content: String) -> Unit
) {
    var subject by remember { mutableStateOf("") }
    var priority by remember { mutableStateOf("high") }
    var content by remember { mutableStateOf("") }

    AlertDialog(
        onDismissRequest = onDismiss,
        title = { Text("Publish Official Notice", fontWeight = FontWeight.Black) },
        text = {
            Column(verticalArrangement = Arrangement.spacedBy(10.dp)) {
                OutlinedTextField(
                    value = subject,
                    onValueChange = { subject = it },
                    label = { Text("Notice Subject") },
                    shape = RoundedCornerShape(12.dp)
                )
                Row(horizontalArrangement = Arrangement.spacedBy(6.dp)) {
                    listOf("high", "medium", "low").forEach { p ->
                        FilterChip(
                            selected = priority == p,
                            onClick = { priority = p },
                            label = { Text(p.uppercase(), fontSize = 10.sp) }
                        )
                    }
                }
                OutlinedTextField(
                    value = content,
                    onValueChange = { content = it },
                    label = { Text("Notice Content") },
                    shape = RoundedCornerShape(12.dp),
                    modifier = Modifier.height(100.dp)
                )
            }
        },
        confirmButton = {
            Button(
                onClick = { if (subject.isNotBlank()) onAdd(subject, priority, content) },
                enabled = subject.isNotBlank()
            ) {
                Text("Publish")
            }
        },
        dismissButton = {
            TextButton(onClick = onDismiss) { Text("Cancel") }
        }
    )
}

@Composable
fun AddQuizDialog(
    onDismiss: () -> Unit,
    onAdd: (question: String, options: List<String>, correctAnswer: Int, subject: String, explanation: String) -> Unit
) {
    var question by remember { mutableStateOf("") }
    var opt0 by remember { mutableStateOf("") }
    var opt1 by remember { mutableStateOf("") }
    var opt2 by remember { mutableStateOf("") }
    var opt3 by remember { mutableStateOf("") }
    var correctIndex by remember { mutableIntStateOf(0) }
    var subject by remember { mutableStateOf("Physics") }
    var explanation by remember { mutableStateOf("") }

    AlertDialog(
        onDismissRequest = onDismiss,
        title = { Text("Create Quiz Question", fontWeight = FontWeight.Black) },
        text = {
            Column(verticalArrangement = Arrangement.spacedBy(8.dp)) {
                OutlinedTextField(
                    value = question,
                    onValueChange = { question = it },
                    label = { Text("Question") },
                    shape = RoundedCornerShape(12.dp)
                )
                OutlinedTextField(
                    value = opt0,
                    onValueChange = { opt0 = it },
                    label = { Text("Option 1 (Index 0)") },
                    shape = RoundedCornerShape(12.dp)
                )
                OutlinedTextField(
                    value = opt1,
                    onValueChange = { opt1 = it },
                    label = { Text("Option 2 (Index 1)") },
                    shape = RoundedCornerShape(12.dp)
                )
                OutlinedTextField(
                    value = opt2,
                    onValueChange = { opt2 = it },
                    label = { Text("Option 3 (Index 2)") },
                    shape = RoundedCornerShape(12.dp)
                )
                OutlinedTextField(
                    value = opt3,
                    onValueChange = { opt3 = it },
                    label = { Text("Option 4 (Index 3)") },
                    shape = RoundedCornerShape(12.dp)
                )
                OutlinedTextField(
                    value = explanation,
                    onValueChange = { explanation = it },
                    label = { Text("Explanation") },
                    shape = RoundedCornerShape(12.dp)
                )
            }
        },
        confirmButton = {
            Button(
                onClick = {
                    val options = listOf(opt0, opt1, opt2, opt3).filter { it.isNotBlank() }
                    if (question.isNotBlank() && options.size >= 2) {
                        onAdd(question, options, correctIndex, subject, explanation)
                    }
                },
                enabled = question.isNotBlank() && opt0.isNotBlank() && opt1.isNotBlank()
            ) {
                Text("Save Quiz")
            }
        },
        dismissButton = {
            TextButton(onClick = onDismiss) { Text("Cancel") }
        }
    )
}
