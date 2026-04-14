import 'package:flutter/material.dart';
import 'package:home_widget/home_widget.dart';
import 'package:intl/intl.dart';
import 'dart:async';

void main() {
  WidgetsFlutterBinding.ensureInitialized();
  runApp(const JadwalApp());
}

class JadwalApp extends StatelessWidget {
  const JadwalApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Jadwal Kuliah Pro',
      debugShowCheckedModeBanner: false,
      theme: ThemeData(
        brightness: Brightness.dark,
        scaffoldBackgroundColor: const Color(0xFF0F172A), // Slate 900
        primaryColor: Colors.blueAccent,
        useMaterial3: true,
      ),
      home: const JadwalHomePage(),
    );
  }
}

class JadwalHomePage extends StatefulWidget {
  const JadwalHomePage({super.key});

  @override
  State<JadwalHomePage> createState() => _JadwalHomePageState();
}

class _JadwalHomePageState extends State<JadwalHomePage> {
  final Map<String, List<Map<String, dynamic>>> schedule = {
    'Senin': [
      {'time': '09:00-11:00', 'name': 'Workshop RPL B', 'start': 900, 'end': 1100},
      {'time': '13:00-15:00', 'name': 'Workshop Sistem Info. Web B', 'start': 1300, 'end': 1500},
    ],
    'Selasa': [
      {'time': '07:00-11:00', 'name': 'Workshop RPL B', 'start': 700, 'end': 1100},
      {'time': '13:00-16:00', 'name': 'Kewarganegaraan / B. Indonesia', 'start': 1300, 'end': 1600},
    ],
    'Rabu': [
      {'time': '13:00-16:00', 'name': 'Workshop Sistem Info. Web Framework B', 'start': 1300, 'end': 1600},
    ],
    'Kamis': [
      {'time': '08:00-11:00', 'name': 'Workshop Sistem Info. Web Framework B', 'start': 800, 'end': 1100},
      {'time': '11:00-13:00', 'name': 'Intermediate English', 'start': 1100, 'end': 1300},
      {'time': '13:00-15:00', 'name': 'Workshop Mobile App Framework B', 'start': 1300, 'end': 1500},
    ],
    'Jumat': [
      {'time': '07:00-09:00', 'name': 'Literasi Digital / Konsep Dasar Jaringan', 'start': 700, 'end': 900},
      {'time': '13:00-15:00', 'name': 'Sistem Operasi / Trend Teknologi', 'start': 1300, 'end': 1500},
      {'time': '15:00-17:00', 'name': 'Statistika', 'start': 1500, 'end': 1700},
    ],
  };

  late Timer _timer;
  String currentDay = '';
  int currentTimeInt = 0;

  @override
  void initState() {
    super.initState();
    _updateTime();
    _timer = Timer.periodic(const Duration(minutes: 1), (timer) => _updateTime());
  }

  @override
  void dispose() {
    _timer.cancel();
    super.dispose();
  }

  void _updateTime() {
    final now = DateTime.now();
    setState(() {
      currentDay = DateFormat('EEEE').format(now);
      // Translate to Indonesian for matching keys
      Map<String, String> dayMap = {
        'Monday': 'Senin',
        'Tuesday': 'Selasa',
        'Wednesday': 'Rabu',
        'Thursday': 'Kamis',
        'Friday': 'Jumat',
        'Saturday': 'Sabtu',
        'Sunday': 'Minggu',
      };
      currentDay = dayMap[currentDay] ?? currentDay;
      currentTimeInt = now.hour * 100 + now.minute;
    });
    _updateWidget();
  }

  Future<void> _updateWidget() async {
    String currentClass = "Tidak ada kelas";
    String nextClass = "Selesai untuk hari ini";

    final todaySchedule = schedule[currentDay] ?? [];
    for (var item in todaySchedule) {
      if (currentTimeInt >= item['start'] && currentTimeInt < item['end']) {
        currentClass = item['name'];
      } else if (currentTimeInt < item['start'] && nextClass == "Selesai untuk hari ini") {
        nextClass = "Berikutnya: ${item['name']} (${item['time']})";
      }
    }

    await HomeWidget.saveWidgetData<String>('current_class', currentClass);
    await HomeWidget.saveWidgetData<String>('next_class', nextClass);
    await HomeWidget.updateWidget(
      name: 'ScheduleWidgetProvider',
      androidName: 'ScheduleWidgetProvider',
    );
  }

  @override
  Widget build(BuildContext context) {
    final todaySchedule = schedule[currentDay] ?? [];

    return Scaffold(
      body: CustomScrollView(
        slivers: [
          SliverAppBar(
            expandedHeight: 150.0,
            floating: false,
            pinned: true,
            flexibleSpace: FlexibleSpaceBar(
              title: Text('Jadwal $currentDay', 
                style: const TextStyle(fontWeight: FontWeight.bold, color: Colors.white)),
              background: Container(
                decoration: const BoxDecoration(
                  gradient: LinearGradient(
                    colors: [Color(0xFF1E293B), Color(0xFF0F172A)],
                    begin: Alignment.topCenter,
                    end: Alignment.bottomCenter,
                  ),
                ),
              ),
            ),
          ),
          SliverPadding(
            padding: const EdgeInsets.all(16.0),
            sliver: todaySchedule.isEmpty
                ? const SliverFillRemaining(
                    child: Center(child: Text('Tidak ada jadwal hari ini')),
                  )
                : SliverList(
                    delegate: SliverChildBuilderDelegate(
                      (context, index) {
                        final item = todaySchedule[index];
                        final isOngoing = currentTimeInt >= item['start'] && currentTimeInt < item['end'];
                        
                        return Card(
                          margin: const EdgeInsets.only(bottom: 16),
                          color: isOngoing ? Colors.blueAccent.withOpacity(0.2) : const Color(0xFF1E293B),
                          shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(12),
                            side: BorderSide(
                              color: isOngoing ? Colors.blueAccent : Colors.transparent,
                              width: 2,
                            ),
                          ),
                          child: ListTile(
                            contentPadding: const EdgeInsets.all(16),
                            title: Text(
                              item['name'],
                              style: TextStyle(
                                fontWeight: FontWeight.bold,
                                fontSize: 18,
                                color: isOngoing ? Colors.blueAccent : Colors.white,
                              ),
                            ),
                            subtitle: Padding(
                              padding: const EdgeInsets.top(8.0),
                              child: Row(
                                children: [
                                  const Icon(Icons.access_time, size: 16, color: Colors.grey),
                                  const SizedBox(width: 8),
                                  Text(item['time'], style: const TextStyle(color: Colors.grey)),
                                  if (isOngoing) ...[
                                    const Spacer(),
                                    Container(
                                      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                                      decoration: BoxDecoration(
                                        color: Colors.blueAccent,
                                        borderRadius: BorderRadius.circular(4),
                                      ),
                                      child: const Text('SEDANG BERLANGSUNG', 
                                        style: TextStyle(fontSize: 10, fontWeight: FontWeight.bold)),
                                    ),
                                  ],
                                ],
                              ),
                            ),
                          ),
                        );
                      },
                      childCount: todaySchedule.length,
                    ),
                  ),
          ),
        ],
      ),
    );
  }
}
