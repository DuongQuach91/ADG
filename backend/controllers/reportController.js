import Report from '../models/Report.js';

export const createReport = async (req, res) => {
  try {
    const { type, subject, content, targetUser, targetComment } = req.body;

    const reportData = {
      reporter: req.user._id,
      type,
      subject,
      content,
    };

    if (type === 'report_user' && targetUser) {
      reportData.targetUser = targetUser;
    }

    if (type === 'report_comment' && targetComment) {
      reportData.targetComment = targetComment;
    }

    const report = await Report.create(reportData);

    res.status(201).json({
      success: true,
      data: report,
      message: 'Đã gửi phản hồi thành công. Chúng tôi sẽ xem xét và phản hồi sớm nhất.',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Lỗi server',
      error: error.message,
    });
  }
};

export const getMyReports = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const reports = await Report.find({ reporter: req.user._id })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Report.countDocuments({ reporter: req.user._id });

    res.json({
      success: true,
      data: reports,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Lỗi server',
      error: error.message,
    });
  }
};

export const getReportById = async (req, res) => {
  try {
    const report = await Report.findById(req.params.id)
      .populate('targetUser', 'name email')
      .populate('targetComment', 'content');

    if (!report) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy phản hồi',
      });
    }

    if (report.reporter.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Bạn không có quyền xem phản hồi này',
      });
    }

    res.json({
      success: true,
      data: report,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Lỗi server',
      error: error.message,
    });
  }
};

export const getAllReports = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const { status, type } = req.query;

    const filter = {};
    if (status) filter.status = status;
    if (type) filter.type = type;

    const reports = await Report.find(filter)
      .populate('reporter', 'name email')
      .populate('targetUser', 'name email')
      .populate('targetComment', 'content')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Report.countDocuments(filter);

    res.json({
      success: true,
      data: reports,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Lỗi server',
      error: error.message,
    });
  }
};

export const updateReportStatus = async (req, res) => {
  try {
    const { status, adminNote } = req.body;

    const report = await Report.findById(req.params.id);

    if (!report) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy phản hồi',
      });
    }

    report.status = status;
    if (adminNote) report.adminNote = adminNote;

    if (status === 'resolved' || status === 'rejected') {
      report.resolvedAt = new Date();
      report.resolvedBy = req.user._id;
    }

    await report.save();

    res.json({
      success: true,
      data: report,
      message: 'Đã cập nhật trạng thái phản hồi',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Lỗi server',
      error: error.message,
    });
  }
};
