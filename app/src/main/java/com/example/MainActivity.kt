package com.example

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import androidx.activity.viewModels
import androidx.compose.foundation.layout.*
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material.icons.outlined.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.studysnap.ui.components.NoteReaderDialog
import com.example.studysnap.ui.screens.*
import com.example.studysnap.ui.theme.BluePrimary
import com.example.studysnap.ui.theme.StudySnapTheme
import com.example.studysnap.ui.viewmodel.StudySnapViewModel
import kotlinx.coroutines.flow.collectLatest

class MainActivity : ComponentActivity() {

    private val viewModel: StudySnapViewModel by viewModels()

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()

        setContent {
            StudySnapTheme {
                val snackbarHostState = remember { SnackbarHostState() }
                val selectedTab by viewModel.selectedTab.collectAsState()
                val readingNote by viewModel.readingNote.collectAsState()

                LaunchedEffect(Unit) {
                    viewModel.toastMessage.collectLatest { message ->
                        snackbarHostState.showSnackbar(message)
                    }
                }

                Scaffold(
                    modifier = Modifier.fillMaxSize(),
                    snackbarHost = { SnackbarHost(snackbarHostState) },
                    bottomBar = {
                        NavigationBar(
                            modifier = Modifier.testTag("bottom_nav_bar"),
                            containerColor = MaterialTheme.colorScheme.surface,
                            tonalElevation = 8.dp
                        ) {
                            NavigationBarItem(
                                selected = selectedTab == "home",
                                onClick = { viewModel.selectTab("home") },
                                icon = {
                                    Icon(
                                        imageVector = if (selectedTab == "home") Icons.Filled.Home else Icons.Outlined.Home,
                                        contentDescription = "Home"
                                    )
                                },
                                label = { Text("Home", fontSize = 10.sp, fontWeight = FontWeight.Bold) },
                                colors = NavigationBarItemDefaults.colors(selectedIconColor = BluePrimary),
                                modifier = Modifier.testTag("nav_item_home")
                            )

                            NavigationBarItem(
                                selected = selectedTab == "notes",
                                onClick = { viewModel.selectTab("notes") },
                                icon = {
                                    Icon(
                                        imageVector = if (selectedTab == "notes") Icons.Filled.MenuBook else Icons.Outlined.MenuBook,
                                        contentDescription = "Notes"
                                    )
                                },
                                label = { Text("Notes", fontSize = 10.sp, fontWeight = FontWeight.Bold) },
                                colors = NavigationBarItemDefaults.colors(selectedIconColor = BluePrimary),
                                modifier = Modifier.testTag("nav_item_notes")
                            )

                            NavigationBarItem(
                                selected = selectedTab == "quiz",
                                onClick = { viewModel.selectTab("quiz") },
                                icon = {
                                    Icon(
                                        imageVector = if (selectedTab == "quiz") Icons.Filled.Psychology else Icons.Outlined.Psychology,
                                        contentDescription = "Quiz"
                                    )
                                },
                                label = { Text("Quiz", fontSize = 10.sp, fontWeight = FontWeight.Bold) },
                                colors = NavigationBarItemDefaults.colors(selectedIconColor = BluePrimary),
                                modifier = Modifier.testTag("nav_item_quiz")
                            )

                            NavigationBarItem(
                                selected = selectedTab == "doubts",
                                onClick = { viewModel.selectTab("doubts") },
                                icon = {
                                    Icon(
                                        imageVector = if (selectedTab == "doubts") Icons.Filled.AutoAwesome else Icons.Outlined.AutoAwesome,
                                        contentDescription = "Doubts"
                                    )
                                },
                                label = { Text("AI Doubts", fontSize = 10.sp, fontWeight = FontWeight.Bold) },
                                colors = NavigationBarItemDefaults.colors(selectedIconColor = BluePrimary),
                                modifier = Modifier.testTag("nav_item_doubts")
                            )

                            NavigationBarItem(
                                selected = selectedTab == "leaderboard",
                                onClick = { viewModel.selectTab("leaderboard") },
                                icon = {
                                    Icon(
                                        imageVector = if (selectedTab == "leaderboard") Icons.Filled.Leaderboard else Icons.Outlined.Leaderboard,
                                        contentDescription = "Ranks"
                                    )
                                },
                                label = { Text("Ranks", fontSize = 10.sp, fontWeight = FontWeight.Bold) },
                                colors = NavigationBarItemDefaults.colors(selectedIconColor = BluePrimary),
                                modifier = Modifier.testTag("nav_item_ranks")
                            )

                            NavigationBarItem(
                                selected = selectedTab == "notices",
                                onClick = { viewModel.selectTab("notices") },
                                icon = {
                                    Icon(
                                        imageVector = if (selectedTab == "notices") Icons.Filled.Campaign else Icons.Outlined.Campaign,
                                        contentDescription = "Notices"
                                    )
                                },
                                label = { Text("Notices", fontSize = 10.sp, fontWeight = FontWeight.Bold) },
                                colors = NavigationBarItemDefaults.colors(selectedIconColor = BluePrimary),
                                modifier = Modifier.testTag("nav_item_notices")
                            )

                            NavigationBarItem(
                                selected = selectedTab == "settings",
                                onClick = { viewModel.selectTab("settings") },
                                icon = {
                                    Icon(
                                        imageVector = if (selectedTab == "settings") Icons.Filled.Person else Icons.Outlined.Person,
                                        contentDescription = "Profile"
                                    )
                                },
                                label = { Text("Profile", fontSize = 10.sp, fontWeight = FontWeight.Bold) },
                                colors = NavigationBarItemDefaults.colors(selectedIconColor = BluePrimary),
                                modifier = Modifier.testTag("nav_item_settings")
                            )
                        }
                    }
                ) { innerPadding ->
                    Box(modifier = Modifier.padding(innerPadding)) {
                        when (selectedTab) {
                            "home" -> HomeScreen(viewModel = viewModel)
                            "notes" -> NotesScreen(viewModel = viewModel)
                            "quiz" -> QuizScreen(viewModel = viewModel)
                            "doubts" -> DoubtSolverScreen(viewModel = viewModel)
                            "leaderboard" -> LeaderboardScreen(viewModel = viewModel)
                            "notices" -> NoticesScreen(viewModel = viewModel)
                            "settings" -> ProfileSettingsScreen(viewModel = viewModel)
                            else -> HomeScreen(viewModel = viewModel)
                        }
                    }

                    readingNote?.let { note ->
                        NoteReaderDialog(
                            note = note,
                            onDismiss = { viewModel.closeNote() }
                        )
                    }
                }
            }
        }
    }
}
