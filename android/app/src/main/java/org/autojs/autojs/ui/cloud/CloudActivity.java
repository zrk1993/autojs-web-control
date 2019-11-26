package org.autojs.autojs.ui.cloud;


import android.graphics.Color;
import android.os.Bundle;
import android.os.Handler;
import android.view.KeyEvent;
import android.view.Menu;
import android.view.MenuItem;
import android.widget.Button;
import android.widget.Toast;

import androidx.annotation.Nullable;
import androidx.appcompat.widget.Toolbar;
import androidx.fragment.app.Fragment;
import androidx.recyclerview.widget.RecyclerView;

import com.stardust.util.BackPressedHandler;

import org.androidannotations.annotations.AfterViews;
import org.androidannotations.annotations.Click;
import org.androidannotations.annotations.EActivity;
import org.androidannotations.annotations.ViewById;
import org.autojs.autojs.R;

import org.autojs.autojs.pluginclient.DevPluginService;
import org.autojs.autojs.tool.AccessibilityServiceTool;
import org.autojs.autojs.ui.BaseActivity;
import org.autojs.autojs.ui.log.LogActivity_;
import org.autojs.autojs.ui.main.MainActivity_;

import io.reactivex.android.schedulers.AndroidSchedulers;
import io.reactivex.disposables.Disposable;

@EActivity(R.layout.activity_cloud)
public class CloudActivity extends BaseActivity {

    @ViewById(R.id.drawer_menu)
    RecyclerView mDrawerMenu;

    @ViewById(R.id.start)
    Button mStartButton;

    private Disposable mConnectionStateDisposable;

    @Override
    protected void onCreate(@Nullable Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        applyDayNightMode();
    }
    @AfterViews
    void setupViews() {
        Toolbar toolbar = findViewById(R.id.toolbar);
        toolbar.setTitle("云控V8.22");
        setSupportActionBar(toolbar);

        mConnectionStateDisposable = DevPluginService.getInstance().connectionState()
                .observeOn(AndroidSchedulers.mainThread())
                .subscribe(state -> {
                    if (mStartButton == null) return;
                    if (state.getState() == DevPluginService.State.CONNECTED && AccessibilityServiceTool.isAccessibilityServiceEnabled(this)) {
                        mStartButton.setText("已连接，正在运行");
                    } else {
                        mStartButton.setText("离线，未连接");
                    }
                    if (state.getState() == DevPluginService.State.CONNECTING) {
                        mStartButton.setText("正在尝试连接");
                    }
                    if (state.getException() != null) {
                        mStartButton.setText("连接异常：" + state.getException().getMessage());
                    }
                });
    }

    @Override
    public boolean onCreateOptionsMenu(Menu menu) {
        getMenuInflater().inflate(R.menu.menu_cloud, menu);
        return true;
    }
    @Override
    public boolean onOptionsItemSelected(MenuItem item) {
        if (item.getItemId() == R.id.action_log) {
            LogActivity_.intent(this).start();
            return true;
        }
        if (item.getItemId() == R.id.action_setting) {
            CloudSettingActivity_.intent(this).start();
            return true;
        }
        return super.onOptionsItemSelected(item);
    }

    @Click(R.id.start)
    void start() {
        boolean isAccessibilityServiceEnabled = AccessibilityServiceTool.isAccessibilityServiceEnabled(this);
        boolean isConnected = DevPluginService.getInstance().isConnected();

        if (isAccessibilityServiceEnabled == false) {
            Toast.makeText(this, "请到设置开启无障碍服务", Toast.LENGTH_LONG).show();
            return;
        }

        if (isConnected == false) {
            Toast.makeText(this, "请到设置连接服务器", Toast.LENGTH_LONG).show();
            return;
        }

        mStartButton.setText("已连接，正在运行");
    }

    private boolean mIsExit;
    /**
     * 双击返回键退出
     */
    @Override
    public boolean onKeyDown(int keyCode, KeyEvent event) {
        if (keyCode == KeyEvent.KEYCODE_BACK) {
            if (mIsExit) {
                this.finish();

            } else {
                Toast.makeText(this, "再按一次退出", Toast.LENGTH_SHORT).show();
                mIsExit = true;
                new Handler().postDelayed(new Runnable() {
                    @Override
                    public void run() {
                        mIsExit = false;
                    }
                }, 2000);
            }
            return true;
        }
        return super.onKeyDown(keyCode, event);
    }
}
